/**
 * VinR Demo SPA Logic
 */

// Core DOM
const appRoot = document.getElementById('app-root');
const globalNav = document.getElementById('global-nav');

// Router State
let currentScreen = 'welcome';

// Palette
const PALETTE = {
    GOLD: '#D4AF37',
    GOLD_BRIGHT: '#F2C84B',
    VOID: '#05040E',
    PURPLE_ACCENT: '#7B5EF8'
};

/**
 * SCREEN DEFINITIONS
 */

const screens = {
    welcome: {
        render: () => {
            globalNav.style.display = 'none';
            appRoot.innerHTML = `
                <div class="welcome-container">
                    <!-- Base Gradient -->
                    <div class="welcome-bg"></div>
                    <div class="welcome-vignette"></div>

                    <!-- Warp Streaks -->
                    <div class="streaks-container" id="streaks"></div>

                    <!-- Ambient Blobs -->
                    <div class="blobs-container">
                        <div class="ambient-blob" style="background: rgba(212,175,55,0.065); width: 460px; height: 460px; top: 3%; left: -90px; animation-duration: 5.4s; animation-delay: 0.2s;"></div>
                        <div class="ambient-blob" style="background: rgba(123,94,248,0.10); width: 380px; height: 380px; top: 8%; right: -110px; animation-duration: 6.6s; animation-delay: 0.5s;"></div>
                        <div class="ambient-blob" style="background: rgba(212,175,55,0.04); width: 300px; height: 300px; top: 52%; left: 25%; animation-duration: 4.8s; animation-delay: 0.8s;"></div>
                        <div class="ambient-blob" style="background: rgba(40,90,210,0.07); width: 340px; height: 340px; top: 58%; right: -70px; animation-duration: 8s; animation-delay: 0.3s;"></div>
                    </div>

                    <!-- Starfield -->
                    <div class="starfield" id="stars"></div>

                    <!-- Gyroscope & Logo Zone -->
                    <div class="logo-zone">
                        <div class="orbit-ring orbit-base" style="width:158px; height:158px; animation-duration:7.2s; animation-delay:0.9s;"></div>
                        <div class="orbit-ring orbit-secondary reverse" style="width:198px; height:198px; animation-duration:12s; animation-delay:1.1s;"></div>
                        <div class="orbit-ring orbit-base" style="width:244px; height:244px; animation-duration:18s; animation-delay:1.3s;"></div>
                        <div class="orbit-ring orbit-micro reverse" style="width:290px; height:290px; animation-duration:28s; animation-delay:1.5s;"></div>
                        
                        <div class="logo-bed-outer2"></div>
                        <div class="logo-bed-outer"></div>
                        <div class="logo-bed"></div>
                        <div class="logo-ring-static"></div>
                        <div class="logo-ring-micro"></div>

                        <div class="wordmark-wrap">
                            <div class="uline-track"><div class="uline-beam"></div></div>
                            <span class="logo-vin">vin</span>
                            <div class="r-container">
                                <div class="comet-streak-halo"></div>
                                <div class="comet-streak"></div>
                                <span class="logo-r">R</span>
                            </div>
                        </div>
                    </div>

                    <!-- Headlines -->
                    <div class="headline-block">
                        <h1 class="h1">Win your</h1>
                        <h2 class="h2">life back.</h2>
                        <p class="sub">The science-based system that rebuilds<br>your habits, identity & momentum.</p>
                    </div>

                    <div class="welcome-spacer"></div>

                    <!-- Details Box & CTA -->
                    <div class="liquid-cta" onclick="navigateTo('dashboard')">
                        <div class="cta-glow"></div>
                        <div class="cta-border"></div>
                        <div class="liquid-fill-wrap">
                            <div class="liquid-fill"></div>
                            <div class="cta-shimmer"></div>
                        </div>
                        <div class="cta-label-row">
                            <span class="cta-text">Begin your winning journey</span>
                            <div class="cta-arrow-circle"><span class="cta-arrow">›</span></div>
                        </div>
                    </div>

                    <!-- Trust Bar -->
                    <div class="trust-bar">
                        <div class="trust-pill"><span class="t-icon">⚡</span><span class="t-label">Science-backed</span></div>
                        <div class="trust-sep"></div>
                        <div class="trust-pill"><span class="t-icon">✦</span><span class="t-label">AI-powered</span></div>
                        <div class="trust-sep"></div>
                        <div class="trust-pill"><span class="t-icon">◎</span><span class="t-label">21-day engine</span></div>
                    </div>
                </div>
            `;
            
            // Generate Streaks
            const streakContainer = document.getElementById('streaks');
            for(let i=0; i<28; i++) {
                const angle = i * (360/28);
                const core = document.createElement('div');
                core.className = 'warp-streak core';
                core.style.transform = `rotate(${angle}deg) translateX(0) scaleX(1)`;
                core.style.animationDelay = `${i*18}ms`;
                streakContainer.appendChild(core);

                const halo = document.createElement('div');
                halo.className = 'warp-streak halo';
                halo.style.transform = `rotate(${angle+2}deg) translateX(0) scaleX(1)`;
                halo.style.animationDelay = `${i*18+60}ms`;
                streakContainer.appendChild(halo);
            }

            // Generate Stars
            const starfield = document.getElementById('stars');
            const starsData = [
                {x: 10, y: 17, r: 2.5, d: 900},
                {x: 83, y: 11, r: 3, d: 1200},
                {x: 65, y: 29, r: 2, d: 1500},
                {x: 21, y: 39, r: 3, d: 1800},
                {x: 91, y: 45, r: 2, d: 2100},
                {x: 45, y: 68, r: 2, d: 2400, color: 'rgba(160,110,255,0.9)', spd: 3000},
                {x: 6, y: 57, r: 2.5, d: 2700, color: 'rgba(160,110,255,0.9)', spd: 2800},
                {x: 95, y: 25, r: 2, d: 3000},
                {x: 35, y: 82, r: 1.8, d: 1600, color: 'rgba(212,175,55,0.7)', spd: 3400},
                {x: 72, y: 75, r: 1.5, d: 2200, color: 'rgba(160,110,255,0.6)', spd: 2400}
            ];

            starsData.forEach(s => {
                const starWrap = document.createElement('div');
                starWrap.className = 'star-wrap';
                starWrap.style.left = `${s.x}%`;
                starWrap.style.top = `${s.y}%`;
                starWrap.style.animationDelay = `${s.d}ms`;

                if(s.color) {
                    starWrap.innerHTML = `
                        <div class="star-halo" style="width:${s.r*4}px; height:${s.r*4}px; background:${s.color}; animation-delay:${s.d}ms; animation-duration:${s.spd}ms"></div>
                        <div class="star-core" style="width:${s.r}px; height:${s.r}px; background:${s.color}; animation-delay:${s.d}ms"></div>
                    `;
                } else {
                    starWrap.innerHTML = `
                        <div class="star-core" style="width:${s.r}px; height:${s.r}px; animation-delay:${s.d}ms"></div>
                    `;
                }
                starfield.appendChild(starWrap);
            });
        }
    },
    checkin: {
        render: () => {
            globalNav.style.display = 'flex';
            appRoot.innerHTML = `
                <div class="checkin-container">
                    <div class="ambient-bg"></div>
                    
                    <div class="checkin-title">How are you feeling?</div>
                    <div class="checkin-sub">Select your mood — we'll personalize your experience</div>

                    <div class="mood-grid">
                        <!-- row 1 -->
                        <div class="mood-orb" onclick="selectMood(this)">
                            <div class="icon-wrap"><i data-lucide="cloud" style="width:22px; height:22px; color:rgba(40,90,210,1);"></i></div>
                            <span class="label">Calm</span>
                        </div>
                        <div class="mood-orb" onclick="selectMood(this)">
                            <div class="icon-wrap"><i data-lucide="zap" style="width:22px; height:22px; color:var(--gold);"></i></div>
                            <span class="label">Anxious</span>
                        </div>
                        <div class="mood-orb" onclick="selectMood(this)">
                            <div class="icon-wrap"><i data-lucide="sun" style="width:22px; height:22px; color:#F5C842;"></i></div>
                            <span class="label">Happy</span>
                        </div>
                        <div class="mood-orb" onclick="selectMood(this)">
                            <div class="icon-wrap"><i data-lucide="cloud-rain" style="width:22px; height:22px; color:#7AB5E8;"></i></div>
                            <span class="label">Sad</span>
                        </div>
                        
                        <!-- row 2 -->
                        <div class="mood-orb" onclick="selectMood(this)">
                            <div class="icon-wrap"><i data-lucide="target" style="width:22px; height:22px; color:#2ECC71;"></i></div>
                            <span class="label">Focused</span>
                        </div>
                        <div class="mood-orb" onclick="selectMood(this)">
                            <div class="icon-wrap"><i data-lucide="battery-low" style="width:22px; height:22px; color:var(--purple-accent);"></i></div>
                            <span class="label">Tired</span>
                        </div>
                        <div class="mood-orb" onclick="selectMood(this)">
                            <div class="icon-wrap"><i data-lucide="heart" style="width:22px; height:22px; color:#DC3545;"></i></div>
                            <span class="label">Grateful</span>
                        </div>
                        <div class="mood-orb" onclick="selectMood(this)">
                            <div class="icon-wrap"><i data-lucide="flame" style="width:22px; height:22px; color:#E84545;"></i></div>
                            <span class="label">Frustrated</span>
                        </div>
                    </div>

                    <div class="checkin-textarea-wrap">
                        <textarea class="checkin-textarea" placeholder="I'm feeling... mechanics of the day..." oninput="updateCharCount(this)"></textarea>
                        <div class="char-counter"><span id="char-count">0</span>/300</div>
                    </div>

                    <div style="animation: fadeInDown 0.5s ease forwards; opacity: 0; animation-delay: 0.5s;">
                        <button class="gold-btn" id="analyze-btn" disabled onclick="navigateTo('checkinResult')">
                            Analyze my feelings <i data-lucide="arrow-right" style="width:18px; height:18px;"></i>
                        </button>
                    </div>

                    <div class="privacy-badge">
                        <i data-lucide="lock" style="width:12px; height:12px;"></i>
                        <span class="privacy-text">Private & secure — your data is encrypted</span>
                    </div>

                </div>
            `;
            lucide.createIcons();
            updateNav('checkin');

            // Wire up interactive functionality
            window.selectMood = function(el) {
                document.querySelectorAll('.mood-orb').forEach(orb => orb.classList.remove('selected'));
                el.classList.add('selected');
                document.getElementById('analyze-btn').disabled = false;
            };

            window.updateCharCount = function(el) {
                const count = el.value.length;
                document.getElementById('char-count').innerText = count;
                if(count > 300) {
                    el.value = el.value.substring(0, 300);
                    document.getElementById('char-count').innerText = 300;
                }
            };
        }
    },
    checkinResult: {
        render: () => {
            globalNav.style.display = 'flex';
            appRoot.innerHTML = `
                <div class="checkin-result-container">
                    <div class="ambient-bg"></div>
                    
                    <div class="cr-insight-card">
                        <div class="cr-insight-quote">"Feeling tired can be a sign of burnout, but taking a short break can help you recharge. Consider the activities that bring you joy and help you relax."</div>
                        <div class="cr-insight-sub">It's normal to feel tired, and there are many ways to manage it.</div>
                    </div>

                    <div class="cr-section-label">TODAY'S AFFIRMATION</div>
                    <div class="cr-affirmation">"You are capable of managing your energy and finding rest when you need it."</div>

                    <div class="cr-info-card">
                        <i data-lucide="heart" style="width:20px; height:20px; color:rgba(122,181,232,1); flex-shrink:0; margin-top:2px;"></i>
                        <div class="cr-info-text">Please consider seeking professional support if you are experiencing chronic burnout or exhaustion.</div>
                    </div>

                    <!-- Immediate Relief -->
                    <div class="cr-list-header">
                        <div class="cr-list-title"><i data-lucide="zap" style="width:16px; height:16px; color:var(--gold);"></i> Immediate Relief</div>
                        <div class="cr-badge">3</div>
                    </div>

                    <div class="cr-item">
                        <div class="cr-item-left">
                            <div class="cr-item-icon" style="color:#7AB5E8;"><i data-lucide="wind" style="width:20px; height:20px;"></i></div>
                            <div>
                                <div class="cr-item-title">Progressive Muscle Rel...</div>
                                <div class="cr-item-meta"><i data-lucide="clock" style="width:12px; height:12px;"></i> 10 minutes <div class="cr-tag"><i data-lucide="flame" style="width:10px; height:10px;"></i> Easy</div></div>
                            </div>
                        </div>
                        <div class="cr-play-btn"><i data-lucide="play" style="width:16px; height:16px; fill:var(--gold);"></i></div>
                    </div>
                    <div class="cr-item">
                        <div class="cr-item-left">
                            <div class="cr-item-icon" style="color:var(--gold);"><i data-lucide="zap" style="width:20px; height:20px;"></i></div>
                            <div>
                                <div class="cr-item-title">Forest Bathing</div>
                                <div class="cr-item-meta"><i data-lucide="clock" style="width:12px; height:12px;"></i> 20 minutes <div class="cr-tag"><i data-lucide="flame" style="width:10px; height:10px;"></i> Easy</div></div>
                            </div>
                        </div>
                        <div class="cr-play-btn"><i data-lucide="play" style="width:16px; height:16px; fill:var(--gold);"></i></div>
                    </div>
                    <div class="cr-item">
                        <div class="cr-item-left">
                            <div class="cr-item-icon" style="color:var(--gold);"><i data-lucide="zap" style="width:20px; height:20px;"></i></div>
                            <div>
                                <div class="cr-item-title">Creative Expression</div>
                                <div class="cr-item-meta"><i data-lucide="clock" style="width:12px; height:12px;"></i> 20 minutes <div class="cr-tag"><i data-lucide="flame" style="width:10px; height:10px;"></i> Easy</div></div>
                            </div>
                        </div>
                        <div class="cr-play-btn"><i data-lucide="play" style="width:16px; height:16px; fill:var(--gold);"></i></div>
                    </div>

                    <div style="height: 24px;"></div>

                    <!-- Daily Habit Journal -->
                    <div class="cr-list-header">
                        <div class="cr-list-title"><i data-lucide="leaf" style="width:16px; height:16px; color:#2ecc71;"></i> Daily Habit Journal</div>
                        <div class="cr-badge">3</div>
                    </div>

                    <div class="cr-item">
                        <div class="cr-item-left">
                            <div class="cr-item-icon" style="color:var(--purple-accent);"><i data-lucide="star" style="width:20px; height:20px;"></i></div>
                            <div>
                                <div class="cr-item-title">Mindful Morning</div>
                                <div class="cr-item-meta"><i data-lucide="clock" style="width:12px; height:12px;"></i> 10 minutes <div class="cr-tag"><i data-lucide="flame" style="width:10px; height:10px;"></i> Easy</div></div>
                            </div>
                        </div>
                        <div class="cr-play-btn"><i data-lucide="play" style="width:16px; height:16px; fill:var(--gold);"></i></div>
                    </div>
                    <div class="cr-item">
                        <div class="cr-item-left">
                            <div class="cr-item-icon" style="color:var(--text-mid);"><i data-lucide="activity" style="width:20px; height:20px;"></i></div>
                            <div>
                                <div class="cr-item-title">Physical Activity</div>
                                <div class="cr-item-meta"><i data-lucide="clock" style="width:12px; height:12px;"></i> 30 minutes <div class="cr-tag"><i data-lucide="flame" style="width:10px; height:10px;"></i> Easy</div></div>
                            </div>
                        </div>
                        <div class="cr-play-btn"><i data-lucide="play" style="width:16px; height:16px; fill:var(--gold);"></i></div>
                    </div>
                    <div class="cr-item">
                        <div class="cr-item-left">
                            <div class="cr-item-icon" style="color:var(--gold);"><i data-lucide="zap" style="width:20px; height:20px;"></i></div>
                            <div>
                                <div class="cr-item-title">Social Connection</div>
                                <div class="cr-item-meta"><i data-lucide="clock" style="width:12px; height:12px;"></i> 30 minutes <div class="cr-tag"><i data-lucide="flame" style="width:10px; height:10px;"></i> Easy</div></div>
                            </div>
                        </div>
                        <div class="cr-play-btn"><i data-lucide="play" style="width:16px; height:16px; fill:var(--gold);"></i></div>
                    </div>

                    <div class="cr-reflection">
                        <div class="cr-reflection-label">TONIGHT'S REFLECTION</div>
                        <div class="cr-reflection-text">Tonight, reflect on the small moments of joy and relaxation that brought you happiness today.</div>
                    </div>

                    <button class="gold-btn" style="animation: fadeInDown 0.6s ease forwards; opacity: 0; animation-delay: 0.7s;" onclick="navigateTo('journal')">Start my journal journey <i data-lucide="arrow-right" style="width:18px; height:18px; margin-left:8px;"></i></button>
                    <a href="#" class="cr-save-link" onclick="navigateTo('dashboard')">Save for later</a>
                </div>
            `;
            lucide.createIcons();
            updateNav('checkin');
        }
    },
    journal: {
        render: () => {
            globalNav.style.display = 'flex';
            appRoot.innerHTML = `
                <div class="journal-container">
                    <div class="ambient-bg"></div>

                    <div class="journal-title">Gratitude Journal</div>
                    <div class="journal-subtitle">What are you grateful for today?</div>

                    <div class="search-toggle">
                        <i data-lucide="search" style="width:14px; height:14px;"></i> Search entries
                    </div>

                    <div class="calendar-card">
                        <div class="cal-header">
                            <i data-lucide="chevron-left" style="width:20px; height:20px; cursor:pointer;"></i>
                            <span>April 2026</span>
                            <i data-lucide="chevron-right" style="width:20px; height:20px; cursor:pointer;"></i>
                        </div>
                        <div class="cal-grid">
                            <div class="cal-day-name">S</div>
                            <div class="cal-day-name">M</div>
                            <div class="cal-day-name">T</div>
                            <div class="cal-day-name">W</div>
                            <div class="cal-day-name">T</div>
                            <div class="cal-day-name">F</div>
                            <div class="cal-day-name">S</div>

                            <div class="cal-day"></div>
                            <div class="cal-day"></div>
                            <div class="cal-day has-entry">1</div>
                            <div class="cal-day has-entry">2</div>
                            <div class="cal-day">3</div>
                            <div class="cal-day active">4</div>
                            <div class="cal-day">5</div>
                        </div>
                    </div>

                    <div class="insight-card">
                        <div class="insight-header">
                            <i data-lucide="sparkles" style="width:18px; height:18px;"></i>
                            Weekly Insight
                        </div>
                        <div class="insight-text">You've consistently found gratitude in small moments this week, improving your focus.</div>
                        <div class="insight-meta">2 entries this week</div>
                    </div>

                    <div class="mode-toggle">
                        <div class="mode-btn active" onclick="this.parentNode.querySelector('.mode-btn:not(.active)').classList.remove('active'); this.classList.add('active');">
                            <i data-lucide="pen-line" style="width:14px; height:14px;"></i> Write
                        </div>
                        <div class="mode-btn" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active');">
                            <i data-lucide="book-open" style="width:14px; height:14px;"></i> Entries
                        </div>
                    </div>

                    <div class="write-area">
                        <textarea class="journal-input" placeholder="Today I am grateful for..."></textarea>
                        <button class="gold-btn">Save Entry</button>
                    </div>

                </div>
            `;
            lucide.createIcons();
            updateNav('journal');
        }
    },
    glint: {
        render: () => {
            globalNav.style.display = 'flex';
            appRoot.innerHTML = `
                <div class="glint-container">
                    <div class="glint-header">
                        <div class="glint-header-left">
                            <i data-lucide="flame" style="width:24px; height:24px; color:var(--gold);"></i>
                            <span class="glint-title">Glint</span>
                            <div class="glint-topic-badge">Stress Relief</div>
                        </div>
                        <i data-lucide="refresh-cw" style="width:20px; height:20px; color:var(--text-lo);"></i>
                    </div>

                    <!-- Dummy Video Feed item -->
                    <div class="glint-card">
                        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600&h=900" class="glint-thumbnail" alt="video thumbnail" />
                        <div class="glint-gradient"></div>
                        
                        <div class="play-overlay">
                            <i data-lucide="play" style="width:24px; height:24px; fill: white;"></i>
                        </div>

                        <div class="glint-info">
                            <div class="glint-video-title">5 Minute Stress Relief Yoga Flow</div>
                            <div class="glint-channel-row">
                                <div class="glint-channel-badge">YogaWithAdriene</div>
                                <div class="glint-audio">
                                    <i data-lucide="music" style="width:12px; height:12px;"></i>
                                    Original Audio
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Dummy Video Feed item 2 -->
                    <div class="glint-card">
                        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600&h=900" class="glint-thumbnail" alt="video thumbnail 2" />
                        <div class="glint-gradient"></div>

                        <div class="glint-info">
                            <div class="glint-video-title">Guided Meditation for Anxiety</div>
                            <div class="glint-channel-row">
                                <div class="glint-channel-badge">Meditation Room</div>
                                <div class="glint-audio">
                                    <i data-lucide="music" style="width:12px; height:12px;"></i>
                                    Original Audio
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            updateNav('glint');
        }
    },
    profile: {
        render: () => {
            globalNav.style.display = 'flex';
            appRoot.innerHTML = `
                <div class="profile-container">
                    <div class="ambient-bg"></div>

                    <div class="profile-header">
                        <div class="avatar-circle">
                            <i data-lucide="user" style="width:40px; height:40px; color: var(--gold);"></i>
                        </div>
                        <div class="profile-title">My Journey</div>
                        <div class="profile-subtitle">Refinement statistics</div>
                        <div class="settings-btn" onclick="navigateTo('settings')">
                            <i data-lucide="settings" style="width:24px; height:24px;"></i>
                        </div>
                    </div>

                    <div class="stats-row">
                        <div class="stat-card">
                            <div class="stat-icon-wrap" style="background: rgba(212, 175, 55, 0.15);">
                                <i data-lucide="message-square" style="width:18px; height:18px; color: var(--gold);"></i>
                            </div>
                            <div class="stat-value">42</div>
                            <div class="stat-label">Checks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon-wrap" style="background: rgba(78, 203, 160, 0.15);">
                                <i data-lucide="calendar-days" style="width:18px; height:18px; color: #4ECBA0;"></i>
                            </div>
                            <div class="stat-value">12</div>
                            <div class="stat-label">Days</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon-wrap" style="background: rgba(232, 69, 69, 0.15);">
                                <i data-lucide="flame" style="width:18px; height:18px; color: #E84545;"></i>
                            </div>
                            <div class="stat-value">5</div>
                            <div class="stat-label">Streak</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon-wrap" style="background: rgba(93, 140, 232, 0.15);">
                                <i data-lucide="book-text" style="width:18px; height:18px; color: var(--sapphire);"></i>
                            </div>
                            <div class="stat-value">8</div>
                            <div class="stat-label">Journals</div>
                        </div>
                    </div>

                    <div class="period-row">
                        <div class="period-chip" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active');">7 days</div>
                        <div class="period-chip" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active');">14 days</div>
                        <div class="period-chip active" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active');">30 days</div>
                    </div>

                    <div class="profile-section">
                        <div class="profile-section-title">Evolving State</div>
                        <div class="chart-card">
                            <div class="chart-placeholder">
                                <i data-lucide="line-chart" style="width:32px; height:32px; margin-right: 8px;"></i>
                                Trend visualization
                            </div>
                            <div class="legend-row">
                                <div class="legend-item">
                                    <div class="legend-dot" style="background: var(--gold);"></div>
                                    <div class="legend-text">Mood</div>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-dot" style="background: #4ECBA0;"></div>
                                    <div class="legend-text">Consistency</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="profile-section">
                        <div class="profile-section-title">Emotional Spectrum</div>
                        <div class="chart-card">
                            <div class="donut-bars">
                                <div class="donut-row">
                                    <div class="donut-label-row">
                                        <div class="legend-dot" style="background: var(--gold);"></div>
                                        <div class="donut-label">Grateful</div>
                                        <div class="donut-pct">45%</div>
                                    </div>
                                    <div class="donut-bg">
                                        <div class="donut-fill" style="width: 45%; background: var(--gold);"></div>
                                    </div>
                                </div>
                                <div class="donut-row">
                                    <div class="donut-label-row">
                                        <div class="legend-dot" style="background: #4ECBA0;"></div>
                                        <div class="donut-label">Calm</div>
                                        <div class="donut-pct">30%</div>
                                    </div>
                                    <div class="donut-bg">
                                        <div class="donut-fill" style="width: 30%; background: #4ECBA0;"></div>
                                    </div>
                                </div>
                                <div class="donut-row">
                                    <div class="donut-label-row">
                                        <div class="legend-dot" style="background: #E8A85D;"></div>
                                        <div class="donut-label">Anxious</div>
                                        <div class="donut-pct">25%</div>
                                    </div>
                                    <div class="donut-bg">
                                        <div class="donut-fill" style="width: 25%; background: #E8A85D;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="correlation-card">
                        <div class="correlation-icon">
                            <i data-lucide="bar-chart-2" style="width:24px; height:24px;"></i>
                        </div>
                        <div class="correlation-text">
                            Your state improves by <span style="color: #4ECBA0; font-weight: 600;">15%</span> with consistent practice.
                        </div>
                    </div>

                    <div class="profile-section">
                        <div class="profile-section-title">Path Insights</div>
                        <div class="insight-card-view">
                            <div class="stat-icon-wrap" style="background: rgba(212, 175, 55, 0.1); margin-bottom: 0;">
                                <i data-lucide="trending-up" style="width:18px; height:18px; color: var(--gold);"></i>
                            </div>
                            <div style="flex: 1; font-size: 14px; color: var(--text-primary); line-height: 1.4;">
                                You tend to feel more grounded after a 10-minute check-in.
                            </div>
                        </div>
                    </div>

                </div>
            `;
            lucide.createIcons();
            updateNav('profile');
        }
    },
    settings: {
        render: () => {
            globalNav.style.display = 'none'; // hide nav for nested screen
            appRoot.innerHTML = `
                <div class="profile-container" style="padding-top: 60px;">
                    <div class="ambient-bg"></div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
                        <i data-lucide="chevron-left" style="width:24px; height:24px; color:var(--text-hi); cursor:pointer;" onclick="navigateTo('profile')"></i>
                        <span style="font-size:18px; font-weight:600; color:var(--text-hi);">Settings</span>
                        <div style="width:24px;"></div> <!-- spacer -->
                    </div>

                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; margin-bottom: 24px; animation: fadeInDown 0.5s ease forwards; opacity: 0; animation-delay: 0.1s;">
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor:pointer;">
                            <div style="display: flex; align-items: center; gap: 12px; color: var(--text-hi); font-size: 15px;">
                                <i data-lucide="user" style="color:var(--text-mid); width:20px;"></i> Account
                            </div>
                            <i data-lucide="chevron-right" style="color:var(--text-lo); width:18px;"></i>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor:pointer;">
                            <div style="display: flex; align-items: center; gap: 12px; color: var(--text-hi); font-size: 15px;">
                                <i data-lucide="bell" style="color:var(--text-mid); width:20px;"></i> Notifications
                            </div>
                            <i data-lucide="chevron-right" style="color:var(--text-lo); width:18px;"></i>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; cursor:pointer;">
                            <div style="display: flex; align-items: center; gap: 12px; color: var(--text-hi); font-size: 15px;">
                                <i data-lucide="lock" style="color:var(--text-mid); width:20px;"></i> Privacy & Data
                            </div>
                            <i data-lucide="chevron-right" style="color:var(--text-lo); width:18px;"></i>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; margin-bottom: 24px; animation: fadeInDown 0.5s ease forwards; opacity: 0; animation-delay: 0.2s;">
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor:pointer;">
                            <div style="display: flex; align-items: center; gap: 12px; color: var(--text-hi); font-size: 15px;">
                                <i data-lucide="circle-help" style="color:var(--text-mid); width:20px;"></i> Help Center
                            </div>
                            <i data-lucide="chevron-right" style="color:var(--text-lo); width:18px;"></i>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; cursor:pointer;">
                            <div style="display: flex; align-items: center; gap: 12px; color: #E84545; font-size: 15px;">
                                <i data-lucide="log-out" style="width:20px;"></i> Log Out
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; color: var(--text-lo); font-size: 12px; margin-top: 40px; animation: fadeInDown 0.5s ease forwards; opacity: 0; animation-delay: 0.3s;">
                        VinR v2.0.0-demo
                    </div>
                </div>
            `;
            lucide.createIcons();
        }
    },
    chat: {
        render: () => {
            globalNav.style.display = 'none'; // Hide bottom nav in chat
            appRoot.innerHTML = `
                <div class="chat-container">
                    <div class="ambient-bg"></div>
                    
                    <div class="chat-header">
                        <div class="chat-back-btn" onclick="navigateTo('dashboard')">
                            <i data-lucide="arrow-left" style="width:24px; height:24px; color: var(--text-primary);"></i>
                        </div>
                        <div class="chat-persona-info">
                            <div class="chat-persona-name">VinR Buddy</div>
                            <div class="chat-status">
                                <div class="chat-status-dot"></div>
                                Online
                            </div>
                        </div>
                        <div class="chat-back-btn" style="background: transparent; border: none;">
                            <i data-lucide="more-vertical" style="width:20px; height:20px; color: var(--text-primary);"></i>
                        </div>
                    </div>

                    <div class="persona-scroller">
                        <div class="persona-tab active" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active'); document.querySelector('.chat-persona-name').innerText = 'VinR Buddy';">
                            <i data-lucide="sparkles" style="width:15px; height:15px;"></i> VinR Buddy
                        </div>
                        <div class="persona-tab" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active'); document.querySelector('.chat-persona-name').innerText = 'Coach';">
                            <i data-lucide="flame" style="width:15px; height:15px;"></i> Coach
                        </div>
                        <div class="persona-tab" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active'); document.querySelector('.chat-persona-name').innerText = 'Therapist';">
                            <i data-lucide="heart" style="width:15px; height:15px;"></i> Therapist
                        </div>
                        <div class="persona-tab" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active'); document.querySelector('.chat-persona-name').innerText = 'Guide';">
                            <i data-lucide="compass" style="width:15px; height:15px;"></i> Guide
                        </div>
                    </div>

                    <div class="chat-messages" id="chatMessages">
                        <div class="chat-msg-wrapper ai">
                            <div class="chat-bubble ai">
                                Hey! I'm VinR Buddy. How can I help you today?
                            </div>
                            <div class="chat-timestamp">Just now</div>
                        </div>
                    </div>

                    <div class="chat-input-area">
                        <div class="chat-input-box">
                            <input type="text" class="chat-input" id="chatInput" placeholder="Message..." onkeypress="if(event.key === 'Enter') sendDemoMessage()">
                        </div>
                        <div class="chat-mic-btn" onclick="sendDemoMessage()">
                            <i data-lucide="send" style="width:20px; height:20px; margin-left: 2px;"></i>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            
            // Attach demo send message logic
            window.sendDemoMessage = () => {
                const input = document.getElementById('chatInput');
                const messagesList = document.getElementById('chatMessages');
                if(!input.value.trim()) return;
                
                // User msg
                messagesList.innerHTML += `
                    <div class="chat-msg-wrapper user">
                        <div class="chat-bubble user">
                            ${input.value}
                        </div>
                        <div class="chat-timestamp">Just now</div>
                    </div>
                `;
                input.value = '';
                messagesList.scrollTop = messagesList.scrollHeight;

                // AI reply
                setTimeout(() => {
                    messagesList.innerHTML += `
                        <div class="chat-msg-wrapper ai">
                            <div class="chat-bubble ai">
                                I hear you. The demo is fully set up now. Take a deep breath, you're doing great!
                            </div>
                            <div class="chat-timestamp">Just now</div>
                        </div>
                    `;
                    messagesList.scrollTop = messagesList.scrollHeight;
                }, 1000);
            }
        }
    },
    dashboard: {
        render: () => {
            globalNav.style.display = 'flex';
            appRoot.innerHTML = `
                <div class="dashboard-container">
                    <div class="ambient-bg"></div>
                    
                    <!-- Header -->
                    <div class="header-row">
                        <div>
                            <div class="date-chip">
                                <i data-lucide="calendar-days" style="width:11px; height:11px; color:var(--gold);"></i>
                                <span>Saturday, April 4</span>
                            </div>
                            <div class="greeting">GOOD AFTERNOON</div>
                            <div class="welcome-name">Welcome to VinR</div>
                        </div>
                        <div>
                            <div class="avatar-ring">VR</div>
                            <div class="sign-out"><i data-lucide="log-out" style="width:10px; height:10px;"></i> Sign Out</div>
                        </div>
                    </div>

                    <!-- Daily Quote -->
                    <div class="quote-card">
                        <i data-lucide="quote" style="width:14px; height:14px; color:var(--gold); opacity:0.7;"></i>
                        <span class="quote-text">Small steps every day lead to seismic change.</span>
                    </div>

                    <!-- Streak Hero -->
                    <div class="streak-hero-wrap">
                        <div class="glass-card accent-gold">
                            <div class="streak-hero-row">
                                <div class="streak-num-block">
                                    <span class="streak-num">3</span>
                                    <span class="streak-unit">days</span>
                                </div>
                                <div class="flame-icon">
                                    <i data-lucide="flame" style="width:48px; height:48px;"></i>
                                </div>
                                <div class="progress-ring">
                                    <span class="ring-lbl">3/7</span>
                                    <span class="ring-sub">this week</span>
                                </div>
                            </div>
                            <div class="today-status">
                                <i data-lucide="check-circle-2" style="width:14px; height:14px;"></i>
                                Today's check-in complete
                            </div>
                            <div class="week-dots">
                                <div class="day-dot-item"><div class="day-dot done"></div><span class="day-label">M</span></div>
                                <div class="day-dot-item"><div class="day-dot done"></div><span class="day-label">T</span></div>
                                <div class="day-dot-item"><div class="day-dot done"></div><span class="day-label">W</span></div>
                                <div class="day-dot-item"><div class="day-dot"></div><span class="day-label">T</span></div>
                                <div class="day-dot-item"><div class="day-dot"></div><span class="day-label">F</span></div>
                                <div class="day-dot-item"><div class="day-dot"></div><span class="day-label">S</span></div>
                                <div class="day-dot-item"><div class="day-dot"></div><span class="day-label">S</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Nudges: For You -->
                    <div class="section-header" style="animation: fadeInDown 0.6s ease forwards; opacity: 0; animation-delay: 0.3s;">
                        <i data-lucide="sparkles" style="width:20px; height:20px; color:var(--gold);"></i>
                        <span class="section-title">For You</span>
                    </div>
                    
                    <div class="nudge-wrap">
                        <div class="glass-card accent-sapphire" style="padding:16px;" onclick="navigateTo('therapist')">
                            <div class="accent-stripe sapphire"></div>
                            <div class="card-row" style="padding-left:12px;">
                                <div class="icon-wrap" style="background:rgba(40,90,210,0.15);"><i data-lucide="brain" style="width:22px; height:22px; color:rgba(40,90,210,1);"></i></div>
                                <div class="card-content-col">
                                    <div class="card-title">Check-in with Sara</div>
                                    <div class="card-desc">Your AI Therapist is ready to chat.</div>
                                </div>
                                <i data-lucide="chevron-right" style="width:16px; height:16px; color:var(--text-lo);"></i>
                            </div>
                        </div>
                    </div>

                    <!-- AI Companion -->
                    <div class="section-header" style="animation: fadeInDown 0.6s ease forwards; opacity: 0; animation-delay: 0.4s;">
                        <i data-lucide="message-circle" style="width:20px; height:20px; color:var(--purple-accent);"></i>
                        <span class="section-title">Your AI Companion</span>
                    </div>

                    <div class="generic-wrap" style="animation-delay: 0.4s;">
                        <div class="glass-card accent-lavender" style="padding:16px;" onclick="navigateTo('chat')">
                            <div class="card-row">
                                <div class="icon-wrap" style="background:rgba(123,94,248,0.15);"><i data-lucide="sparkles" style="width:22px; height:22px; color:var(--purple-accent);"></i></div>
                                <div class="card-content-col">
                                    <div class="card-title">Talk to VinR Buddy</div>
                                    <div class="card-desc">I'm always here to listen. Share what's on your mind.</div>
                                </div>
                                <i data-lucide="chevron-right" style="width:16px; height:16px; color:var(--text-lo);"></i>
                            </div>
                        </div>
                    </div>

                    <!-- How are you feeling Check-in -->
                    <div class="section-header" style="animation: fadeInDown 0.6s ease forwards; opacity: 0; animation-delay: 0.48s;">
                        <i data-lucide="heart" style="width:20px; height:20px; color:#DC3545;"></i>
                        <span class="section-title">How Are You Feeling?</span>
                    </div>
                    <div class="generic-wrap" style="animation-delay: 0.48s; margin-bottom: 32px;">
                        <button class="gold-btn" onclick="navigateTo('checkin')">Start a Check-In</button>
                    </div>
                    
                </div>
            `;
            lucide.createIcons();
            updateNav('home');
        }
    }
};

/**
 * NAVIGATION
 */
function navigateTo(screenName) {
    if (screens[screenName]) {
        currentScreen = screenName;
        screens[screenName].render();
        
        // Toggle Global Chat FAB
        const chatFab = document.getElementById('global-chat-fab');
        if (chatFab) {
            if (screenName === 'chat' || screenName === 'welcome') {
                chatFab.style.display = 'none';
            } else {
                chatFab.style.display = 'flex';
            }
        }
    }
}

function updateNav(tabId) {
    document.querySelectorAll('.nav-item, .nav-fab').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.tab === tabId) el.classList.add('active');
    });
}

// Bind nav clicks
document.querySelectorAll('.nav-item, .nav-fab').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = el.dataset.tab;
        if (tab === 'home') navigateTo('dashboard');
        else if (tab === 'checkin') navigateTo('checkin');
        else if (tab === 'glint') navigateTo('glint');
        else if (tab === 'journey') navigateTo('journal');
        else if (tab === 'profile') navigateTo('profile');
    });
});

// Boot
window.addEventListener('DOMContentLoaded', () => {
    navigateTo('welcome');
});
