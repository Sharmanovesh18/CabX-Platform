import React, { useState, useEffect, useRef } from 'react';

// --- SVG Icon for the Gift ---
const GiftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 12v10H4V12" />
        <path d="M16 6H8v6h8V6z" />
        <path d="M12 2v4" />
        <path d="M12 12v10" />
        <path d="M20 6h-4" />
        <path d="M4 6h4" />
    </svg>
);


// --- Component Styles ---
const DiscountCtaStyles = () => (
    <style>{`
        .discount-section-wrapper {
            padding: 0 5%;
            margin: 4rem auto;
        }

        .discount-section {
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            color: var(--white);
            padding: 4rem;
            max-width: 1200px;
            margin: 0 auto;
            border-radius: var(--radius-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: left;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 40px -15px rgba(37, 99, 235, 0.3);
        }

        .discount-content {
             position: relative;
             z-index: 2;
             width: 100%;
             display: flex;
             justify-content: space-between;
             align-items: center;
             gap: 4rem;
        }
        
        .discount-text-column {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .discount-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1.25rem;
            border-radius: var(--radius-full);
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .discount-text-column h2 {
            font-family: var(--font-heading);
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            letter-spacing: -0.02em;
        }

        .discount-text-column p {
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.9);
            max-width: 480px;
            margin-bottom: 2.5rem;
            line-height: 1.6;
        }

        .discount-timer-column {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: var(--radius-lg);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .timer-title {
            font-size: 1.125rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .countdown-timer {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1.5rem;
        }

        .timer-box {
            background: rgba(255, 255, 255, 0.15);
            padding: 1rem;
            border-radius: var(--radius-md);
            width: 90px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
        }

        .timer-number {
            font-size: 2.25rem;
            font-weight: 800;
            display: block;
            line-height: 1;
            font-family: var(--font-heading);
        }

        .timer-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 600;
            margin-top: 4px;
            opacity: 0.8;
            display: block;
        }
        
        .timer-separator {
            font-size: 2rem;
            font-weight: 700;
            opacity: 0.5;
            padding-bottom: 1.5rem;
        }

        .discount-button {
            background-color: var(--white);
            color: var(--primary);
            border: none;
            padding: 1.25rem 3rem;
            border-radius: var(--radius-md);
            font-size: 1.125rem;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-lg);
        }

        .discount-button:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
            background-color: var(--background);
        }

        @media (max-width: 1024px) {
            .discount-content {
                flex-direction: column;
                text-align: center;
                gap: 3rem;
            }
            .discount-text-column {
                align-items: center;
            }
            .discount-text-column p {
                margin-left: auto;
                margin-right: auto;
            }
        }
        
        .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
        }
        
        .confetti {
            position: absolute;
            opacity: 0;
            animation: confetti-fall linear forwards;
        }
        
        @keyframes confetti-fall {
            0% {
                transform: translateY(-10vh) rotateZ(var(--start-angle)) rotateX(0);
                opacity: 1;
            }
            100% {
                transform: translateY(110vh) rotateZ(var(--end-angle)) rotateX(1080deg);
                opacity: 0;
            }
        }
    `}</style>
);

function DiscountCTA() {
    const [timeLeft, setTimeLeft] = useState({});
    const [confetti, setConfetti] = useState([]);
    const animationFrameId = useRef(null);
    const lastSpawnTime = useRef(0);

    // Countdown Timer Effect
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            
            const difference = endOfDay - now;
            let timeLeftData = {};

            if (difference > 0) {
                timeLeftData = {
                    hours: Math.floor(difference / (1000 * 60 * 60)),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return Object.fromEntries(
                Object.entries(timeLeftData).map(([key, value]) => [
                    key, value.toString().padStart(2, '0')
                ])
            );
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Constant and Smooth Confetti Stream Effect
    useEffect(() => {
        const shapes = ['rect', 'circle', 'squiggle'];
        const colors = ['#FFFFFF', '#818CF8', '#A78BFA', '#F472B6'];

        const animateConfetti = (timestamp) => {
            if (timestamp - lastSpawnTime.current > 50) { // Control spawn rate
                lastSpawnTime.current = timestamp;

                const newParticleId = timestamp + Math.random();
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                
                let style = {
                    left: `${Math.random() * 100}%`,
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    animationDuration: `${4 + Math.random() * 3}s`,
                    '--start-angle': `${Math.random() * 360}deg`,
                    '--end-angle': `${720 + Math.random() * 720}deg`,
                };

                if (shape === 'rect') {
                    style.width = '8px';
                    style.height = '15px';
                } else if (shape === 'circle') {
                    style.width = '10px';
                    style.height = '10px';
                    style.borderRadius = '50%';
                } else if (shape === 'squiggle') {
                    style.width = '12px';
                    style.height = '12px';
                    style.backgroundColor = 'transparent';
                    style.border = `2px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
                    style.borderRadius = '50%';
                    style.clipPath = 'polygon(0 0, 100% 0, 100% 50%, 0 50%)';
                }


                const newParticle = { id: newParticleId, style };

                setConfetti(current => [...current, newParticle]);

                setTimeout(() => {
                    setConfetti(current => current.filter(p => p.id !== newParticleId));
                }, 7000);
            }
            animationFrameId.current = requestAnimationFrame(animateConfetti);
        };
        
        animationFrameId.current = requestAnimationFrame(animateConfetti);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);
    

    return (
        <>
            <DiscountCtaStyles />
            <div className="discount-section-wrapper">
                <section id="discount" className="discount-section">
                    <div className="confetti-container">
                        {confetti.map(c => <div key={c.id} className="confetti" style={c.style}></div>)}
                    </div>
                    <div className="discount-content">
                         <div className="discount-text-column">
                            <div className="discount-badge">
                                <GiftIcon />
                                <span>Offer Ends Today!</span>
                            </div>
                            <h2>Get 25% OFF On Your First Ride</h2>
                            <p>Sign up now and enjoy a special discount on your first journey. This exclusive offer is only available for a limited time!</p>
                            <a href="#" className="discount-button">
                                Claim My 25% Discount
                            </a>
                        </div>
                        <div className="discount-timer-column">
                            <h3 className="timer-title">Hurry, Deal Ends In!</h3>
                            <div className="countdown-timer">
                                <div className="timer-box">
                                    <span className="timer-number">{timeLeft.hours || '00'}</span>
                                    <span className="timer-label">Hours</span>
                                </div>
                                <div className="timer-separator">:</div>
                                <div className="timer-box">
                                    <span className="timer-number">{timeLeft.minutes || '00'}</span>
                                    <span className="timer-label">Minutes</span>
                                </div>
                                <div className="timer-separator">:</div>
                                <div className="timer-box">
                                    <span className="timer-number">{timeLeft.seconds || '00'}</span>
                                    <span className="timer-label">Seconds</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default DiscountCTA;
