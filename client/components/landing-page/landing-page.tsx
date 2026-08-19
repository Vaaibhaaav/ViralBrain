'use client';

import { useEffect, useRef } from 'react';
import { Fraunces, Newsreader, Inter, IBM_Plex_Mono } from 'next/font/google';
import { useUser } from '@clerk/nextjs';
import { Link } from 'lucide-react';

const fraunces = Fraunces({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    weight: ['400', '500', '600'],
    variable: '--font-fraunces',
    display: 'swap',
});
const newsreader = Newsreader({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    weight: ['400', '500'],
    variable: '--font-newsreader',
    display: 'swap',
});
const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
    display: 'swap',
});
const plexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['500', '600'],
    variable: '--font-plexmono',
    display: 'swap',
});

const PROMPTS = [
    "Why most creators quit at 10k followers — and the mindset shift that changes everything",
    "3 hooks that stopped me from scrolling past a boring recipe video",
    "The posting schedule that took my page from 200 to 40,000 followers",
    "What nobody tells you about going viral once",
];

const PACK_COPY = {
    TikTok: 'Hook: freeze on your analytics tab. “This number is lying to you.” Four-beat shot list included.',
    Instagram: 'Seven-slide carousel walking through the idea, plus a caption and twelve hashtag sets ready to post.',
    Twitter: 'Six-tweet thread, each one pre-sized to the character limit, opening with the strongest line first.',
};

export default function LandingPage() {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const charNumRef = useRef<HTMLSpanElement>(null);
    const generateBtnRef = useRef<HTMLButtonElement>(null);
    const genLabelRef = useRef<HTMLSpanElement>(null);
    const packResultsRef = useRef<HTMLDivElement>(null);
    const p1Ref = useRef<HTMLParagraphElement>(null);
    const p2Ref = useRef<HTMLParagraphElement>(null);
    const p3Ref = useRef<HTMLParagraphElement>(null);
    const statPacksRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const cleanups: Array<() => void> = [];

        // ---- scroll progress ----
        const onScroll = () => {
            const h = document.documentElement;
            const scrolled = h.scrollTop;
            const height = h.scrollHeight - h.clientHeight;
            if (progressRef.current) {
                progressRef.current.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
            }
        };
        document.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        cleanups.push(() => document.removeEventListener('scroll', onScroll));

        // ---- scroll reveal ----
        const reveals = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window && !reduceMotion) {
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => {
                        if (e.isIntersecting) {
                            e.target.classList.add('in');
                            io.unobserve(e.target);
                        }
                    });
                },
                { threshold: 0.12 }
            );
            reveals.forEach((el) => io.observe(el));
            cleanups.push(() => io.disconnect());
        } else {
            reveals.forEach((el) => el.classList.add('in'));
        }

        // ---- scrollspy for nav / toc ----
        const sectionIds = ['studio', 'workflow', 'platforms', 'dispatch', 'subscribe'];
        const sections = sectionIds
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => !!el);
        const navLinkEls = document.querySelectorAll('#navLinks a, #tocNav a');
        let spy: IntersectionObserver | undefined;
        if ('IntersectionObserver' in window) {
            spy = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => {
                        if (e.isIntersecting) {
                            const id = e.target.id;
                            navLinkEls.forEach((a) => {
                                a.classList.toggle('active', a.getAttribute('data-sec') === id);
                            });
                        }
                    });
                },
                { rootMargin: '-45% 0px -50% 0px' }
            );
            sections.forEach((s) => spy!.observe(s));
            cleanups.push(() => spy!.disconnect());
        }

        // ---- typewriter demo ----
        const input = inputRef.current;
        const charNum = charNumRef.current;
        let promptIdx = 0;
        let charIdx = 0;
        let typing = true;
        let userTyping = false;
        let typerHandle: ReturnType<typeof setTimeout>;

        const updateCount = () => {
            if (input && charNum) charNum.textContent = String(input.value.length);
        };

        const typeStep = () => {
            if (userTyping || !input) return;
            const target = PROMPTS[promptIdx];
            if (typing) {
                if (charIdx <= target.length) {
                    input.value = target.slice(0, charIdx);
                    charIdx++;
                    updateCount();
                    typerHandle = setTimeout(typeStep, 26 + Math.random() * 22);
                } else {
                    typing = false;
                    typerHandle = setTimeout(typeStep, 1400);
                }
            } else {
                if (charIdx >= 0) {
                    input.value = target.slice(0, charIdx);
                    charIdx--;
                    updateCount();
                    typerHandle = setTimeout(typeStep, 12);
                } else {
                    typing = true;
                    promptIdx = (promptIdx + 1) % PROMPTS.length;
                    charIdx = 0;
                    typerHandle = setTimeout(typeStep, 400);
                }
            }
        };

        const onFocus = () => {
            userTyping = true;
            clearTimeout(typerHandle);
            if (input) input.value = '';
            updateCount();
        };
        input?.addEventListener('focus', onFocus);
        input?.addEventListener('input', updateCount);
        cleanups.push(() => {
            input?.removeEventListener('focus', onFocus);
            input?.removeEventListener('input', updateCount);
            clearTimeout(typerHandle);
        });

        if (!reduceMotion) {
            typerHandle = setTimeout(typeStep, 900);
        } else if (input) {
            input.value = PROMPTS[0];
            updateCount();
        }

        // ---- platform pills ----
        const pillEls = document.querySelectorAll('.pill');
        const onPillClick = (e: Event) => {
            (e.currentTarget as HTMLElement).classList.toggle('on');
        };
        pillEls.forEach((p) => p.addEventListener('click', onPillClick));
        cleanups.push(() => pillEls.forEach((p) => p.removeEventListener('click', onPillClick)));

        // ---- generate pack demo ----
        let generated = false;
        const onGenerate = () => {
            const btn = generateBtnRef.current;
            const label = genLabelRef.current;
            const results = packResultsRef.current;
            const statPacks = statPacksRef.current;
            if (!btn || btn.classList.contains('loading')) return;
            btn.classList.add('loading');
            if (label) label.textContent = 'Generating…';
            clearTimeout(typerHandle);

            setTimeout(
                () => {
                    btn.classList.remove('loading');
                    if (label) label.textContent = generated ? 'Regenerate Pack' : 'Generate Pack';
                    if (p1Ref.current) p1Ref.current.textContent = PACK_COPY.TikTok;
                    if (p2Ref.current) p2Ref.current.textContent = PACK_COPY.Instagram;
                    if (p3Ref.current) p3Ref.current.textContent = PACK_COPY.Twitter;
                    results?.classList.add('show');

                    if (!generated && statPacks) {
                        generated = true;
                        const current = parseInt(statPacks.textContent?.replace(/[^0-9]/g, '') || '0', 10);
                        const next = current + 1;
                        statPacks.innerHTML = next.toLocaleString('en-US') + '<sup>1</sup>';
                    }
                },
                reduceMotion ? 50 : 900
            );
        };
        generateBtnRef.current?.addEventListener('click', onGenerate);
        cleanups.push(() => generateBtnRef.current?.removeEventListener('click', onGenerate));

        return () => cleanups.forEach((fn) => fn());
    }, []);

    return (
        <div className={`${fraunces.variable} ${newsreader.variable} ${inter.variable} ${plexMono.variable} page-root`}>
            <div className="progress" ref={progressRef} />

            {/* ================= MASTHEAD ================= */}
            {user && <header className="masthead">
                <div className="wrap">
                    <div className="masthead-meta">
                        <span>Subscriber Dashboard Edition</span>
                        <span>№ 048,236 · Est. 2026</span>
                    </div>
                </div>
                <div className="masthead-rule" />
                <div className="wrap">
                    <div className="masthead-word">
                        <span className="mark">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z" fill="#F3EEE2" />
                            </svg>
                        </span>
                        <h1>ViralBrain</h1>
                        <p>A studio for people who&apos;d rather create than caption.</p>
                    </div>
                    <div className="masthead-nav">
                        <nav className="toc" id="tocNav">
                            <a href="#studio" data-sec="studio"><span className="num">I.</span> Studio</a>
                            <a href="#workflow" data-sec="workflow"><span className="num">II.</span> Workflow</a>
                            <a href="#platforms" data-sec="platforms"><span className="num">III.</span> Platforms</a>
                            <a href="#dispatch" data-sec="dispatch"><span className="num">IV.</span> Dispatch</a>
                            <a href="#subscribe" data-sec="subscribe"><span className="num">V.</span> Subscribe</a>
                        </nav>
                    </div>
                </div>
                <div className="masthead-rule bottom" />
            </header>}

            {/* ================= STICKY NAV ================= */}
            {!user && <div className="nav">
                <div className="wrap">
                    <div className="nav-brand">
                        <span className="mark">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z" fill="#F3EEE2" />
                            </svg>
                        </span>
                        ViralBrain
                    </div>
                    <nav className="nav-links" id="navLinks">
                        <a href="#studio" data-sec="studio"><span className="num">I.</span>Studio</a>
                        <a href="#workflow" data-sec="workflow"><span className="num">II.</span>Workflow</a>
                        <a href="#platforms" data-sec="platforms"><span className="num">III.</span>Platforms</a>
                        <a href="#dispatch" data-sec="dispatch"><span className="num">IV.</span>Dispatch</a>
                        <a href="#subscribe" data-sec="subscribe"><span className="num">V.</span>Subscribe</a>
                    </nav>
                    <div className="nav-cta">
                        <Link href="/sign-in" className="signin">Sign in</Link>
                        <Link href="/sign-up" className="btn btn-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z" />
                            </svg>
                            Start free
                        </Link>
                    </div>
                </div>
            </div>}

            {/* ================= I. STUDIO (hero) ================= */}
            <section className="hero" id="studio">
                <div className="wrap">
                    <div className="hero-grid">
                        <div className="hero-copy">
                            <div className="eyebrow">I. THE STUDIO</div>
                            <h2 className="hl">Good morning,<br /><em>creator.</em></h2>
                            <p className="lead">
                                Somewhere between the idea and eleven open tabs, most content dies on the vine. ViralBrain writes
                                the hooks, captions, and shot notes the moment you think of something worth saying — reviewed and
                                scheduled before your coffee&apos;s done.
                            </p>
                            <div className="hero-actions">
                                <a href="#subscribe" className="btn btn-primary btn-lg">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M13 5l7 7-7 7" />
                                    </svg>
                                    Start free
                                </a>
                                <a href="#workflow" className="btn btn-ghost btn-lg">Read the workflow</a>
                            </div>
                            <div className="hero-note">No credit card · 5 free packs a month</div>
                        </div>

                        <div>
                            <div className="plate" id="demoPlate">
                                <div className="plate-bar">
                                    <span className="dot" /><span className="dot" /><span className="dot" />
                                    <span className="url">viralbrain.app/generate</span>
                                </div>
                                <div className="plate-body">
                                    <p className="demo-label">What&apos;s your next piece of content about?</p>
                                    <div className="demo-box" id="demoBox">
                                        <textarea
                                            ref={inputRef}
                                            id="demoInput"
                                            placeholder="Try typing your own idea, or watch one generate itself."
                                            maxLength={280}
                                            rows={3}
                                            defaultValue=""
                                        />
                                        <span className="char-count"><span ref={charNumRef}>0</span>/280</span>
                                    </div>
                                    <div className="config-row">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M4 6h16M4 12h16M4 18h16" />
                                            <circle cx="9" cy="6" r="1.6" fill="currentColor" />
                                            <circle cx="16" cy="12" r="1.6" fill="currentColor" />
                                            <circle cx="11" cy="18" r="1.6" fill="currentColor" />
                                        </svg>
                                        Configure advanced generation settings
                                    </div>
                                    <div className="channels-row">
                                        <div className="channels-col">
                                            <div className="channels-label">DISTRIBUTION CHANNELS</div>
                                            <div className="pills" id="pillRow">
                                                <button className="pill on" data-plat="TikTok">
                                                    TikTok
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                                                </button>
                                                <button className="pill on" data-plat="Instagram">
                                                    Instagram
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                                                </button>
                                                <button className="pill on" data-plat="Twitter">
                                                    Twitter
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                                                </button>
                                                <button className="pill" data-plat="LinkedIn">
                                                    LinkedIn
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary generate-btn" id="generateBtn" ref={generateBtnRef}>
                                            <svg className="spark" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z" fill="currentColor" />
                                            </svg>
                                            <span id="genLabel" ref={genLabelRef}>Generate Pack</span>
                                        </button>
                                    </div>
                                    <div className="pack-results" id="packResults" ref={packResultsRef}>
                                        <div className="pack-mini"><div className="plat">TikTok</div><p ref={p1Ref}>—</p></div>
                                        <div className="pack-mini"><div className="plat">Instagram</div><p ref={p2Ref}>—</p></div>
                                        <div className="pack-mini"><div className="plat">Twitter</div><p ref={p3Ref}>—</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="plate-caption">
                                <span className="fig-caption"><b>FIG. 1</b> — Generate Pack, running live. Try it.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= LEDGER ================= */}
            <section className="ledger">
                <div className="wrap">
                    <div className="ledger-strip">
                        <div className="ledger-item">
                            <div className="ledger-num" id="statPacks" ref={statPacksRef}>48,236<sup>1</sup></div>
                            <div className="ledger-label">Packs generated</div>
                        </div>
                        <div className="ledger-item"><div className="ledger-num">71.8</div><div className="ledger-label">Avg virality score</div></div>
                        <div className="ledger-item"><div className="ledger-num">94%</div><div className="ledger-label">Creator approval</div></div>
                        <div className="ledger-item"><div className="ledger-num">3.1M</div><div className="ledger-label">Posts published</div></div>
                    </div>
                </div>
            </section>

            {/* ================= II. WORKFLOW ================= */}
            <section className="workflow" id="workflow">
                <div className="wrap">
                    <div className="sec-head reveal">
                        <div className="eyebrow">II. WORKFLOW</div>
                        <h2>Four chapters, <em>one Sunday night saved.</em></h2>
                    </div>
                    <div className="chapters reveal">
                        <div className="chapter">
                            <div className="chapter-num">I</div>
                            <div className="chapter-body">
                                <h3>
                                    <span className="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z" /></svg></span>
                                    Generate
                                </h3>
                                <p>Describe the idea once, in a sentence or two. ViralBrain drafts hooks, captions, and shot notes for every platform you&apos;ve turned on.</p>
                            </div>
                        </div>
                        <div className="chapter">
                            <div className="chapter-num">II</div>
                            <div className="chapter-body">
                                <h3>
                                    <span className="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9l-5-6z" /><path d="M9 13l2 2 4-4" /></svg></span>
                                    Review
                                </h3>
                                <p>Approve, edit inline, or send a pack back for another pass. Nothing goes out under your name without your yes.</p>
                            </div>
                        </div>
                        <div className="chapter">
                            <div className="chapter-num">III</div>
                            <div className="chapter-body">
                                <h3>
                                    <span className="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="4" rx="1" /><rect x="4" y="10" width="16" height="4" rx="1" /><rect x="4" y="16" width="16" height="4" rx="1" /></svg></span>
                                    Library
                                </h3>
                                <p>Approved packs land in one searchable library, tagged by topic and platform, scheduled whenever you&apos;re ready to post.</p>
                            </div>
                        </div>
                        <div className="chapter">
                            <div className="chapter-num">IV</div>
                            <div className="chapter-body">
                                <h3>
                                    <span className="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M12 20V4M20 20v-7" /></svg></span>
                                    Analytics
                                </h3>
                                <p>See which hooks actually held attention. That signal feeds straight back into your next Generate — it gets sharper with use.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= III. PLATFORMS ================= */}
            <section className="platforms" id="platforms">
                <div className="wrap">
                    <div className="sec-head reveal">
                        <div className="eyebrow">III. PLATFORMS</div>
                        <h2>One idea, five plates, <em>no copy-paste.</em></h2>
                        <p>The same seed idea, rewritten in the native grammar of each platform — not shortened, translated.</p>
                    </div>
                    <div className="plate-grid reveal">
                        <div>
                            <div className="plate plate-sm forest">
                                <div className="plate-bar"><span className="dot" /><span className="dot" /><span className="dot" /><span className="url">tiktok.script</span></div>
                                <div className="plate-body">
                                    <div className="plat-tag">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" /></svg>
                                        TikTok · Script
                                    </div>
                                    <h4>&quot;The follower number that&apos;s lying to you&quot;</h4>
                                    <p className="cap">Hook (0–3s): freeze on your analytics tab. &quot;This number doesn&apos;t mean what you think it means.&quot; Cut to camera for the reveal…</p>
                                </div>
                            </div>
                            <div className="fig-caption"><b>FIG. 2</b> — 9:16 shot list, four beats, hook timed to the frame.</div>
                        </div>
                        <div>
                            <div className="plate plate-sm">
                                <div className="plate-bar"><span className="dot" /><span className="dot" /><span className="dot" /><span className="url">instagram.caption</span></div>
                                <div className="plate-body">
                                    <div className="plat-tag">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
                                        Instagram · Caption
                                    </div>
                                    <p className="cap">Carousel, slide 1: &quot;Nobody warns you about this before 10k.&quot; Slides 2–6 walk through the shift, slide 7 is the ask. Full caption plus twelve hashtag sets.</p>
                                </div>
                            </div>
                            <div className="fig-caption"><b>FIG. 3</b> — Seven-slide carousel, caption included.</div>
                        </div>
                        <div>
                            <div className="plate plate-sm">
                                <div className="plate-bar"><span className="dot" /><span className="dot" /><span className="dot" /><span className="url">twitter.thread</span></div>
                                <div className="plate-body">
                                    <div className="plat-tag">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2-2 3.3c1.3 8.1-6.6 14-14 11 3-.1 5.1-1.6 5.1-1.6S6.5 16.3 5 12.8c1.3.2 2 0 2 0S3.8 11.3 3.5 7.8c1 .6 2 .6 2 .6S3.5 6 3.5 4c2.5 3 6.5 5 10.5 5-.7-3 2.6-5.5 5.3-3.7C20.5 5 22 4 22 4z" /></svg>
                                        Twitter · Thread
                                    </div>
                                    <p className="cap">Tweet 1: &quot;Everyone quits at the same follower count. Here&apos;s the actual reason — a thread.&quot; Six tweets, each pre-sized to the limit.</p>
                                </div>
                            </div>
                            <div className="fig-caption"><b>FIG. 4</b> — Six-tweet thread, opening line load-bearing.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= IV. DISPATCH ================= */}
            <section className="dispatch" id="dispatch">
                <div className="wrap">
                    <div className="sec-head reveal" style={{ margin: '0 auto 44px', textAlign: 'center' }}>
                        <div className="eyebrow center">IV. DISPATCH</div>
                        <h2>What the last issue&apos;s <em>readers said.</em></h2>
                    </div>
                    <div className="letter reveal">
                        <span className="qmark" aria-hidden="true">&quot;</span>
                        <blockquote>I used to spend Sunday nights writing captions for a whole week of content. Now I spend it approving them.</blockquote>
                        <div className="sig">
                            <div className="name">Priya N.</div>
                            <div className="role">212K FOLLOWERS · FOOD &amp; LIFESTYLE</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= V. SUBSCRIBE ================= */}
            <section className="subscribe" id="subscribe">
                <div className="wrap">
                    <div className="sec-head reveal">
                        <div className="eyebrow">V. SUBSCRIBE</div>
                        <h2>Choose your <em>subscription.</em></h2>
                    </div>
                    <div className="price-grid reveal">
                        <div className="price-card">
                            <div className="price-tier">Free</div>
                            <div className="price-amt">$0</div>
                            <p className="price-desc">For testing the waters.</p>
                            <ul className="price-feats">
                                <li><Check />5 content packs a month</li>
                                <li><Check />Up to 3 platforms</li>
                                <li><Check />Manual scheduling</li>
                                <li><Check />Community support</li>
                            </ul>
                            <a href="#" className="btn btn-ghost">Start free</a>
                        </div>
                        <div className="price-card featured">
                            <span className="ribbon">Most read</span>
                            <div className="price-tier">Creator</div>
                            <div className="price-amt">$29<span>/month</span></div>
                            <p className="price-desc">For posting every day.</p>
                            <ul className="price-feats">
                                <li><Check />Unlimited content packs</li>
                                <li><Check />All 5 platforms</li>
                                <li><Check />Auto-scheduling + calendar</li>
                                <li><Check />Hook performance analytics</li>
                                <li><Check />Priority generation queue</li>
                            </ul>
                            <a href="#" className="btn btn-primary">Start free trial</a>
                        </div>
                        <div className="price-card">
                            <div className="price-tier">Studio</div>
                            <div className="price-amt">$89<span>/month</span></div>
                            <p className="price-desc">For teams and agencies.</p>
                            <ul className="price-feats">
                                <li><Check />Everything in Creator</li>
                                <li><Check />Multi-brand workspaces</li>
                                <li><Check />Editor + approver seats</li>
                                <li><Check />Custom review workflows</li>
                            </ul>
                            <a href="#" className="btn btn-ghost">Talk to us</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FINAL CTA ================= */}
            <section className="final-cta">
                <div className="wrap">
                    <div className="cta-panel reveal">
                        <div className="cta-eol">End of issue — to be continued</div>
                        <h2>Your next post is <em>one idea away.</em></h2>
                        <div className="cta-actions">
                            <a href="#subscribe" className="btn btn-primary btn-lg">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                                Start free — no card needed
                            </a>
                            <a href="#workflow" className="btn btn-ghost btn-lg">Read the workflow</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= COLOPHON ================= */}
            <footer>
                <div className="wrap">
                    <div className="colophon">
                        <div className="colophon-lead">
                            <h5>Colophon</h5>
                            <p>Set in Fraunces for display, Newsreader for text, and IBM Plex Mono for figures. Bound in forest green on cream stock. Printed digitally, for creators who&apos;d rather create than caption.</p>
                        </div>
                        <div className="foot-col">
                            <h5>Product</h5>
                            <a href="#workflow">Workflow</a>
                            <a href="#platforms">Platforms</a>
                            <a href="#subscribe">Subscribe</a>
                        </div>
                        <div className="foot-col">
                            <h5>Company</h5>
                            <a href="#">About</a>
                            <a href="#">Careers</a>
                            <a href="#">Contact</a>
                        </div>
                        <div className="foot-col">
                            <h5>Resources</h5>
                            <a href="#">Help center</a>
                            <a href="#">Ask AI</a>
                            <a href="#">Changelog</a>
                        </div>
                    </div>
                    <div className="foot-bottom">
                        <span className="fn">¹ Aggregated across all active workspaces, trailing 90 days.</span>
                        <span>© 2026 VIRALBRAIN — VOL. 01</span>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
        :root {
          --cream: #f3eee2;
          --cream-2: #ece4d2;
          --cream-3: #e6dcc4;
          --paper: #ffffff;
          --ink: #1b1a15;
          --ink-soft: #423f34;
          --taupe: #8b8574;
          --taupe-2: #a7a08c;
          --line: #dfd5b8;
          --line-soft: #e9e1cc;
          --forest: #23402e;
          --forest-2: #1a3022;
          --forest-deep: #0f1f16;
          --sage: #dce7d8;
          --sage-line: #b7cbb1;
          --gold: #a9832e;
          --gold-dim: #c9a968;
          --gold-pale: #f1e7cb;
          --shadow: 0 1px 2px rgba(27, 26, 21, 0.04), 0 14px 30px -16px rgba(27, 26, 21, 0.2);
          --shadow-lg: 0 3px 8px rgba(27, 26, 21, 0.06), 0 36px 70px -24px rgba(27, 26, 21, 0.26);
          --r-lg: 22px;
          --r-md: 14px;
          --r-sm: 8px;
          --display: var(--font-fraunces), Georgia, serif;
          --text-serif: var(--font-newsreader), Georgia, serif;
          --sans: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --mono: var(--font-plexmono), ui-monospace, monospace;
        }
        *{box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        @media (prefers-reduced-motion: reduce){
          html{scroll-behavior:auto;}
          *{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;}
        }
        body{margin:0;background:var(--cream);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;position:relative;}
        body::before{
          content:"";position:fixed;inset:0;pointer-events:none;opacity:.45;mix-blend-mode:multiply;z-index:1;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.018 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        img,svg{display:block;}
        a{color:inherit;text-decoration:none;}
        button{font-family:inherit;cursor:pointer;}
        ::selection{background:var(--gold-pale);color:var(--forest-deep);}
        :focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:3px;}
        section, header, footer{position:relative;z-index:2;}

        .wrap{max-width:1180px;margin:0 auto;padding:0 40px;}

        .progress{position:fixed;top:0;left:0;height:2px;background:var(--gold);z-index:100;width:0%;transition:width .1s linear;}

        .eyebrow{font-family:var(--mono);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-weight:600;display:flex;align-items:center;gap:10px;}
        .eyebrow::after{content:"";flex:0 0 34px;height:1px;background:var(--line);}
        .eyebrow.center{justify-content:center;}
        .eyebrow.center::after{display:none;}
        .eyebrow.center::before{content:"";flex:0 0 34px;height:1px;background:var(--line);}

        .fig-caption{font-family:var(--mono);font-size:10.5px;color:var(--taupe);letter-spacing:.06em;margin-top:10px;padding-left:2px;}
        .fig-caption b{color:var(--gold);font-weight:600;}

        h1,h2,h3{margin:0;}

        .reveal{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s ease;}
        .reveal.in{opacity:1;transform:translateY(0);}

        .masthead{padding:22px 0 0;}
        .masthead-meta{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:var(--taupe);text-transform:uppercase;padding-bottom:18px;}
        .masthead-rule{height:1px;background:var(--ink);opacity:.85;}
        .masthead-word{text-align:center;padding:34px 0 10px;}
        .masthead-word .mark{width:34px;height:34px;border-radius:9px;background:var(--forest);display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;}
        .masthead-word .mark svg{width:17px;height:17px;}
        .masthead-word h1{font-family:var(--display);font-weight:540;font-size:clamp(40px,7vw,74px);letter-spacing:-.01em;}
        .masthead-word p{font-family:var(--text-serif);font-style:italic;font-size:16px;color:var(--ink-soft);margin-top:10px;}
        .masthead-nav{padding:26px 0 20px;}
        .toc{display:flex;justify-content:center;gap:40px;flex-wrap:wrap;font-size:13.5px;}
        .toc a{display:flex;align-items:center;gap:7px;color:var(--ink-soft);opacity:.72;transition:opacity .15s,color .15s;}
        .toc a .num{font-family:var(--display);font-style:italic;color:var(--gold);font-size:14px;}
        .toc a:hover, .toc a.active{opacity:1;color:var(--ink);}

        .nav{position:sticky;top:0;z-index:50;background:rgba(243,238,226,.88);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
        .nav .wrap{display:flex;align-items:center;justify-content:space-between;height:60px;}
        .nav-brand{display:flex;align-items:center;gap:9px;font-family:var(--display);font-size:16.5px;font-weight:560;}
        .nav-brand .mark{width:20px;height:20px;border-radius:6px;background:var(--forest);display:flex;align-items:center;justify-content:center;}
        .nav-brand .mark svg{width:11px;height:11px;}
        .nav-links{display:flex;gap:30px;font-size:13.5px;}
        .nav-links a{opacity:.68;transition:opacity .15s,color .15s;display:flex;align-items:center;gap:6px;}
        .nav-links a .num{font-family:var(--display);font-style:italic;color:var(--gold);font-size:13px;}
        .nav-links a:hover,.nav-links a.active{opacity:1;}
        .nav-cta{display:flex;align-items:center;gap:20px;}
        .signin{font-size:13.5px;opacity:.7;}
        .signin:hover{opacity:1;}

        .btn{font-family:var(--sans);font-weight:600;font-size:14px;border:none;border-radius:100px;padding:11px 22px;display:inline-flex;align-items:center;gap:8px;transition:transform .15s ease,box-shadow .15s ease,background .15s ease;white-space:nowrap;}
        .btn-primary{background:var(--forest);color:var(--cream);box-shadow:var(--shadow);}
        .btn-primary:hover{background:var(--forest-2);transform:translateY(-1px);box-shadow:var(--shadow-lg);}
        .btn-primary svg{width:14px;height:14px;}
        .btn-ghost{background:transparent;color:var(--ink);border:1px solid var(--line);}
        .btn-ghost:hover{border-color:var(--gold-dim);background:var(--gold-pale);}
        .btn-lg{padding:14px 28px;font-size:15.5px;}

        .hero{padding:80px 0 70px;}
        .hero-grid{display:grid;grid-template-columns:.92fr 1.08fr;gap:64px;align-items:start;}
        .hero-copy h2.hl{font-family:var(--display);font-weight:540;font-size:clamp(38px,5vw,58px);line-height:1.04;letter-spacing:-.02em;margin:16px 0 26px;}
        .hero-copy h2.hl em{font-style:italic;font-weight:440;color:var(--forest);}
        .hero-copy .lead{font-family:var(--text-serif);font-size:19px;line-height:1.62;color:var(--ink-soft);}
        .hero-copy .lead::first-letter{font-family:var(--display);font-weight:560;font-size:64px;line-height:.75;float:left;padding:6px 8px 0 0;color:var(--forest);}
        .hero-actions{display:flex;gap:14px;align-items:center;margin-top:32px;flex-wrap:wrap;}
        .hero-note{font-size:12.5px;color:var(--taupe);margin-top:16px;font-family:var(--mono);letter-spacing:.03em;}

        .plate{border-radius:var(--r-lg);box-shadow:var(--shadow-lg);overflow:hidden;border:1px solid var(--line);background:var(--paper);}
        .plate-bar{display:flex;align-items:center;gap:8px;padding:13px 18px;border-bottom:1px solid var(--line-soft);background:var(--cream-2);}
        .plate-bar .dot{width:7px;height:7px;border-radius:50%;background:var(--taupe-2);opacity:.55;}
        .plate-bar .url{margin-left:10px;font-family:var(--mono);font-size:11px;color:var(--taupe);letter-spacing:.02em;}
        .plate-body{padding:30px 30px 26px;}
        .plate-caption{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-top:16px;flex-wrap:wrap;}

        .demo-label{font-size:15.5px;font-weight:600;margin:0 0 13px;letter-spacing:-.005em;}
        .demo-box{border:1px solid var(--line);border-radius:var(--r-md);background:#fbf8f0;min-height:104px;padding:16px 18px;position:relative;cursor:text;transition:border-color .15s;}
        .demo-box:focus-within{border-color:var(--forest);}
        .demo-box textarea{width:100%;border:none;background:transparent;resize:none;outline:none;font-family:var(--sans);font-size:15px;line-height:1.5;color:var(--ink);min-height:62px;display:block;}
        .demo-box textarea::placeholder{color:var(--taupe-2);}
        .char-count{position:absolute;bottom:10px;right:16px;font-family:var(--mono);font-size:11px;color:var(--taupe-2);}

        .config-row{display:flex;align-items:center;gap:8px;margin:15px 0 17px;font-size:13px;font-weight:600;color:var(--forest);cursor:pointer;width:fit-content;}
        .config-row svg{width:14px;height:14px;opacity:.75;}

        .channels-row{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;padding-top:17px;border-top:1px solid var(--line-soft);}
        .channels-label{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;color:var(--taupe);font-weight:500;}
        .pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px;}
        .pill{display:inline-flex;align-items:center;gap:6px;border-radius:100px;padding:7px 14px;font-size:13px;font-weight:600;border:1px solid var(--line);background:var(--paper);color:var(--ink);transition:all .15s ease;}
        .pill svg{width:12px;height:12px;}
        .pill.on{background:var(--sage);border-color:var(--sage-line);color:var(--forest-2);}
        .pill.on svg{display:block;}
        .pill:not(.on) svg{display:none;}
        .pill:hover{border-color:var(--gold-dim);}
        .channels-col{flex:1;min-width:210px;}

        .generate-btn{position:relative;min-width:158px;justify-content:center;}
        .generate-btn .spark{transition:transform .5s ease;}
        .generate-btn.loading .spark{animation:spin 1s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        .pack-results{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px;max-height:0;opacity:0;overflow:hidden;transition:max-height .5s ease,opacity .4s ease;}
        .pack-results.show{max-height:400px;opacity:1;}
        .pack-mini{background:var(--cream-2);border:1px solid var(--line-soft);border-radius:var(--r-sm);padding:14px;opacity:0;transform:translateY(8px);transition:all .45s ease;}
        .pack-results.show .pack-mini{opacity:1;transform:translateY(0);}
        .pack-results.show .pack-mini:nth-child(1){transition-delay:.05s;}
        .pack-results.show .pack-mini:nth-child(2){transition-delay:.15s;}
        .pack-results.show .pack-mini:nth-child(3){transition-delay:.25s;}
        .pack-mini .plat{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--forest);font-weight:600;margin-bottom:7px;}
        .pack-mini p{margin:0;font-size:13px;line-height:1.45;color:var(--ink-soft);}
        @media (max-width:640px){.pack-results{grid-template-columns:1fr;}}

        .ledger{padding:10px 0 96px;}
        .ledger-strip{border:1px solid var(--line);border-radius:var(--r-md);background:var(--paper);box-shadow:var(--shadow);display:grid;grid-template-columns:repeat(4,1fr);}
        .ledger-item{padding:26px 28px;border-left:1px solid var(--line-soft);position:relative;}
        .ledger-item:first-child{border-left:none;}
        .ledger-num{font-family:var(--mono);font-weight:600;font-size:30px;color:var(--forest);letter-spacing:-.02em;}
        .ledger-num sup{font-family:var(--mono);font-size:12px;color:var(--gold);top:-14px;}
        .ledger-label{font-family:var(--mono);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--taupe);margin-top:5px;}
        @media (max-width:860px){.ledger-strip{grid-template-columns:repeat(2,1fr);}.ledger-item:nth-child(3){border-left:none;}}
        @media (max-width:520px){.ledger-strip{grid-template-columns:1fr;}.ledger-item{border-left:none !important;border-top:1px solid var(--line-soft);}.ledger-item:first-child{border-top:none;}}

        .sec-head{max-width:660px;margin-bottom:60px;}
        .sec-head h2{font-family:var(--display);font-weight:540;font-size:clamp(30px,4vw,44px);letter-spacing:-.015em;line-height:1.08;margin:16px 0 0;}
        .sec-head h2 em{font-style:italic;font-weight:440;color:var(--forest);}
        .sec-head p{font-family:var(--text-serif);font-size:17px;color:var(--ink-soft);margin-top:16px;max-width:520px;}

        .workflow{padding:16px 0 104px;}
        .chapters{border-top:1px solid var(--line);}
        .chapter{display:grid;grid-template-columns:110px 1fr;gap:32px;padding:34px 0;border-bottom:1px solid var(--line);align-items:start;}
        .chapter-num{font-family:var(--display);font-style:italic;font-weight:440;font-size:56px;color:var(--gold);line-height:1;letter-spacing:-.01em;}
        .chapter-body h3{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:600;letter-spacing:-.005em;margin-bottom:9px;}
        .chapter-body h3 .ci{width:30px;height:30px;border-radius:8px;background:var(--sage);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .chapter-body h3 .ci svg{width:15px;height:15px;color:var(--forest);}
        .chapter-body p{font-family:var(--text-serif);font-size:16px;line-height:1.6;color:var(--ink-soft);margin:0;max-width:560px;}
        @media (max-width:640px){.chapter{grid-template-columns:1fr;gap:10px;}.chapter-num{font-size:38px;}}

        .platforms{padding:16px 0 108px;}
        .plate-grid{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:20px;}
        .plate-sm .plate-body{padding:20px 20px 18px;}
        .plate-sm .plat-tag{font-family:var(--mono);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;display:flex;align-items:center;gap:7px;margin-bottom:14px;color:var(--taupe);}
        .plate-sm .plat-tag svg{width:13px;height:13px;}
        .plate-sm h4{font-family:var(--display);font-weight:500;font-size:18px;line-height:1.32;margin:0 0 11px;letter-spacing:-.005em;color:var(--ink);}
        .plate-sm p.cap{font-family:var(--text-serif);font-size:14px;line-height:1.55;margin:0;color:var(--ink-soft);}
        .plate-sm.forest{background:var(--forest);border-color:var(--forest);}
        .plate-sm.forest .plate-bar{background:var(--forest-2);border-color:rgba(244,239,227,.12);}
        .plate-sm.forest .plate-bar .url{color:#9fb79a;}
        .plate-sm.forest .plate-bar .dot{background:#9fb79a;}
        .plate-sm.forest .plat-tag{color:#9fb79a;}
        .plate-sm.forest h4{color:var(--cream);}
        .plate-sm.forest p.cap{color:#d3e1cf;}
        @media (max-width:900px){.plate-grid{grid-template-columns:1fr 1fr;}.plate-grid>*:first-child{grid-column:1/-1;}}
        @media (max-width:560px){.plate-grid{grid-template-columns:1fr;}}

        .dispatch{padding:16px 0 110px;}
        .letter{max-width:760px;margin:0 auto;text-align:center;position:relative;padding:20px 20px 0;}
        .letter .qmark{font-family:var(--display);font-size:150px;color:var(--gold-pale);line-height:.5;position:absolute;top:-10px;left:50%;transform:translateX(-50%);z-index:-1;user-select:none;}
        .letter blockquote{font-family:var(--text-serif);font-style:italic;font-weight:400;font-size:clamp(22px,3.2vw,32px);line-height:1.42;margin:40px 0 30px;color:var(--ink);letter-spacing:-.005em;}
        .letter .sig{display:inline-block;border-top:1px solid var(--line);padding-top:16px;margin:0 auto;}
        .letter .sig .name{font-weight:600;font-size:14.5px;}
        .letter .sig .role{font-size:13px;color:var(--taupe);margin-top:2px;font-family:var(--mono);letter-spacing:.02em;}

        .subscribe{padding:16px 0 112px;}
        .price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch;}
        .price-card{background:var(--paper);border:1px solid var(--line);border-radius:var(--r-lg);padding:30px 26px;display:flex;flex-direction:column;box-shadow:var(--shadow);position:relative;}
        .price-card.featured{border-color:var(--forest);box-shadow:var(--shadow-lg);}
        .ribbon{position:absolute;top:-1px;right:22px;background:var(--gold);color:var(--forest-deep);font-family:var(--mono);font-size:10px;letter-spacing:.09em;font-weight:600;padding:6px 12px;border-radius:0 0 7px 7px;text-transform:uppercase;}
        .price-tier{font-family:var(--display);font-style:italic;font-size:15px;color:var(--forest);margin-bottom:14px;}
        .price-amt{font-family:var(--display);font-size:38px;font-weight:560;letter-spacing:-.02em;}
        .price-amt span{font-family:var(--sans);font-size:13px;font-weight:500;color:var(--taupe);}
        .price-desc{font-family:var(--text-serif);font-style:italic;font-size:14.5px;color:var(--ink-soft);margin:6px 0 24px;}
        .price-feats{list-style:none;margin:0 0 28px;padding:0;display:flex;flex-direction:column;gap:11px;flex:1;}
        .price-feats li{display:flex;gap:9px;font-size:13.5px;line-height:1.4;align-items:flex-start;}
        .price-feats svg{width:15px;height:15px;flex-shrink:0;margin-top:1px;color:var(--forest);}
        .price-card .btn{width:100%;justify-content:center;}
        @media (max-width:900px){.price-grid{grid-template-columns:1fr;}}

        .final-cta{padding:0 0 108px;}
        .cta-panel{background:var(--forest-deep);border-radius:var(--r-lg);padding:76px 60px;text-align:center;position:relative;overflow:hidden;}
        .cta-panel::after{content:"";position:absolute;inset:0;background:radial-gradient(600px 300px at 50% 0%,rgba(201,169,104,.10),transparent 70%);pointer-events:none;}
        .cta-eol{font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--gold-dim);text-transform:uppercase;}
        .cta-panel h2{font-family:var(--display);font-weight:540;color:var(--cream);font-size:clamp(30px,5vw,48px);line-height:1.1;letter-spacing:-.02em;max-width:620px;margin:18px auto 34px;}
        .cta-panel h2 em{font-style:italic;font-weight:440;color:var(--gold-dim);}
        .cta-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}
        .cta-panel .btn-ghost{color:var(--cream);border-color:#33503f;}
        .cta-panel .btn-ghost:hover{background:#173123;border-color:#4e6e5a;}
        @media (max-width:640px){.cta-panel{padding:52px 24px;}}

        footer{border-top:1px solid var(--ink);padding:52px 0 34px;}
        .colophon{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;}
        .colophon h5{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--taupe);margin:0 0 14px;}
        .colophon-lead p{font-family:var(--text-serif);font-style:italic;font-size:14.5px;line-height:1.6;color:var(--ink-soft);margin:0;}
        .foot-col a{display:block;font-size:13.5px;color:var(--ink);opacity:.72;margin-bottom:10px;}
        .foot-col a:hover{opacity:1;}
        .foot-bottom{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;padding-top:22px;border-top:1px solid var(--line);font-size:12px;color:var(--taupe-2);font-family:var(--mono);}
        .foot-bottom .fn{max-width:520px;line-height:1.6;}
        @media (max-width:800px){.colophon{grid-template-columns:1fr 1fr;}}
        @media (max-width:520px){.colophon{grid-template-columns:1fr;}}

        @media (max-width:900px){
          .hero-grid{grid-template-columns:1fr;gap:44px;}
          .nav-links,.toc{display:none;}
          .masthead-meta span:last-child{display:none;}
        }
        @media (max-width:640px){
          .wrap{padding:0 22px;}
          .letter{padding:20px 6px 0;}
          .letter .qmark{font-size:100px;}
        }
      `}</style>
        </div>
    );
}

function Check() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l4 4 10-10" />
        </svg>
    );
}