/**
 * JournalCalendar — Month calendar grid with gold dots on journal days
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface JournalCalendarProps {
    /** Current month string YYYY-MM */
    month: string;
    /** Dates that have journal entries (YYYY-MM-DD strings) */
    entryDates: string[];
    /** Currently selected date */
    selectedDate: string | null;
    /** Called when a date is tapped */
    onSelectDate: (date: string) => void;
    /** Navigate to previous month */
    onPrevMonth: () => void;
    /** Navigate to next month */
    onNextMonth: () => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    // 0 = Sunday, we want Monday = 0
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

function formatMonthLabel(month: string): string {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function JournalCalendar({
    month,
    entryDates,
    selectedDate,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
}: JournalCalendarProps) {
    const { colors, fonts, spacing, borderRadius } = useTheme();
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);
    const daysInMonth = getDaysInMonth(year, monthNum);
    const firstDay = getFirstDayOfMonth(year, monthNum);
    const today = getToday();

    const entrySet = new Set(entryDates);

    // Build grid cells
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md }]}>
            {/* Month header */}
            <View style={styles.header}>
                <Pressable onPress={onPrevMonth} style={[styles.navButton, { backgroundColor: colors.elevated, borderRadius: borderRadius.full }]}>
                    <Text style={[styles.navText, { color: colors.gold }]}>‹</Text>
                </Pressable>
                <Text style={[styles.monthLabel, { color: colors.textPrimary, fontFamily: fonts.bodySemiBold }]}>{formatMonthLabel(month)}</Text>
                <Pressable onPress={onNextMonth} style={[styles.navButton, { backgroundColor: colors.elevated, borderRadius: borderRadius.full }]}>
                    <Text style={[styles.navText, { color: colors.gold }]}>›</Text>
                </Pressable>
            </View>

            {/* Weekday labels */}
            <View style={styles.weekdayRow}>
                {WEEKDAYS.map((day) => (
                    <Text key={day} style={[styles.weekdayLabel, { color: colors.textGhost, fontFamily: fonts.body }]}>{day}</Text>
                ))}
            </View>

            {/* Day grid */}
            <View style={styles.grid}>
                {cells.map((day, idx) => {
                    if (day === null) {
                        return <View key={`empty-${idx}`} style={styles.cell} />;
                    }

                    const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
                    const hasEntry = entrySet.has(dateStr);
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;

                    return (
                        <Pressable
                            key={dateStr}
                            style={[
                                styles.cell,
                                isToday && { borderWidth: 1, borderColor: colors.gold + '60', borderRadius: borderRadius.full },
                                isSelected && { backgroundColor: colors.gold + '20', borderRadius: borderRadius.full },
                            ]}
                            onPress={() => onSelectDate(dateStr)}
                        >
                            <Text
                                style={[
                                    styles.dayNumber,
                                    { color: colors.textMuted, fontFamily: fonts.body },
                                    isToday && { color: colors.gold, fontFamily: fonts.bodySemiBold },
                                    isSelected && { color: colors.gold, fontFamily: fonts.bodySemiBold },
                                ]}
                            >
                                {day}
                            </Text>
                            {hasEntry && <View style={[styles.dot, { backgroundColor: colors.gold }]} />}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    navButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontSize: 22,
        fontWeight: '600',
    },
    monthLabel: {
        fontSize: 16,
    },
    weekdayRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekdayLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNumber: {
        fontSize: 14,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginTop: 2,
    },
});
