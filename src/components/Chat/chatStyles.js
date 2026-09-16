// Shared CSS for anything chat-related (the floating ChatWidget and the
// homepage's embedded FeaturedChat) — kept in one place so both stay visually
// consistent and a style tweak doesn't need to happen twice.
export const orbStyles = `
  @keyframes orbRotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes orbPulse {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.05); opacity: 1; }
  }
  @keyframes orbGlow {
    0%, 100% { box-shadow: 0 0 15px rgba(255, 100, 150, 0.5), 0 0 30px rgba(100, 200, 255, 0.3); }
    33% { box-shadow: 0 0 15px rgba(100, 255, 200, 0.5), 0 0 30px rgba(255, 150, 100, 0.3); }
    66% { box-shadow: 0 0 15px rgba(150, 100, 255, 0.5), 0 0 30px rgba(255, 200, 100, 0.3); }
  }
  .ai-orb {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #ff6b9d,
      #ffa64d,
      #ffed4a,
      #4ade80,
      #22d3ee,
      #818cf8,
      #e879f9,
      #ff6b9d
    );
    animation: orbRotate 3s linear infinite, orbPulse 2s ease-in-out infinite, orbGlow 3s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  .ai-orb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(255, 100, 150, 0.6), 0 0 50px rgba(100, 200, 255, 0.4);
  }
  .ai-orb:disabled {
    cursor: not-allowed;
  }
  .ai-orb.loading {
    animation: orbRotate 0.8s linear infinite, orbPulse 0.5s ease-in-out infinite, orbGlow 1s ease-in-out infinite;
  }
  .ai-orb-inner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2) 50%, transparent 70%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @keyframes aiPing {
    0% { transform: scale(0.85); opacity: 0.7; }
    70% { transform: scale(1.55); opacity: 0; }
    100% { transform: scale(1.7); opacity: 0; }
  }
  @keyframes aiOrbit {
    0% { transform: translate(-50%, -50%) rotate(0deg) translateX(18px); }
    100% { transform: translate(-50%, -50%) rotate(360deg) translateX(18px); }
  }
  @keyframes chatHeaderShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes chatShimmer {
    0% { transform: translateX(-140%); opacity: 0; }
    35% { opacity: 0.6; }
    100% { transform: translateX(220%); opacity: 0; }
  }
  @keyframes chatPop {
    0% { opacity: 0; transform: translateY(6px) scale(0.98); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes onlinePulse {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }
  @keyframes aiWave {
    0%, 100% { transform: scaleY(0.5); opacity: 0.6; }
    50% { transform: scaleY(1.2); opacity: 1; }
  }
  .chatbot-fab {
    position: relative;
    overflow: visible;
    isolation: isolate;
  }
  .chatbot-fab::before {
    content: "";
    position: absolute;
    inset: -8px;
    border-radius: 9999px;
    background: conic-gradient(
      from 0deg,
      rgba(255, 110, 160, 0.7),
      rgba(255, 190, 120, 0.7),
      rgba(80, 220, 255, 0.7),
      rgba(130, 140, 255, 0.7),
      rgba(255, 110, 160, 0.7)
    );
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: -2;
    pointer-events: none;
  }
  .chatbot-fab::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    opacity: 0;
    transform: scale(0.9);
    z-index: -1;
    pointer-events: none;
  }
  .chatbot-fab:hover::before,
  .chatbot-fab:focus-visible::before {
    opacity: 0.9;
    transform: scale(1.05);
  }
  .chatbot-fab:hover::after,
  .chatbot-fab:focus-visible::after {
    opacity: 0.7;
    animation: aiPing 1.6s ease-out infinite;
  }
  .chatbot-fab-orbit {
    position: absolute;
    inset: -6px;
    border-radius: 9999px;
    opacity: 0;
    pointer-events: none;
  }
  .chatbot-fab:hover .chatbot-fab-orbit,
  .chatbot-fab:focus-visible .chatbot-fab-orbit {
    opacity: 1;
  }
  .orbit-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.2));
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
    animation: aiOrbit 2.6s linear infinite;
  }
  .orbit-dot-2 {
    width: 4px;
    height: 4px;
    animation-delay: -0.9s;
  }
  .orbit-dot-3 {
    width: 5px;
    height: 5px;
    animation-delay: -1.7s;
  }
  .chat-header {
    position: relative;
    overflow: hidden;
    background: linear-gradient(120deg, #0f766e, #0ea5a4, #38bdf8, #14b8a6);
    background-size: 220% 220%;
    animation: chatHeaderShift 10s ease infinite;
  }
  .chat-header::after {
    content: "";
    position: absolute;
    top: 0;
    left: -60%;
    height: 100%;
    width: 40%;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.35),
      rgba(255, 255, 255, 0)
    );
    animation: chatShimmer 4.8s ease infinite;
    pointer-events: none;
  }
  .chat-history {
    background-color: #f8fafc;
    background-image: radial-gradient(rgba(15, 118, 110, 0.08) 1px, transparent 1px);
    background-size: 18px 18px;
  }
  .chat-message {
    animation: chatPop 0.25s ease-out;
  }
  .chat-bubble {
    border-radius: 16px;
    padding: 8px 12px;
    font-size: 0.875rem;
    line-height: 1.35rem;
  }
  .chat-bubble-user {
    color: #fff;
    background: linear-gradient(135deg, #0ea5a4, #38bdf8);
    box-shadow: 0 8px 18px rgba(14, 165, 164, 0.25);
  }
  .chat-bubble-assistant {
    color: #0f172a;
    background: #ffffff;
    border-left: 3px solid rgba(20, 184, 166, 0.7);
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  }
  .ai-avatar {
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    background: conic-gradient(from 180deg, #38bdf8, #14b8a6, #0ea5a4, #38bdf8);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
    flex-shrink: 0;
  }
  .ai-avatar.ai-avatar-sm {
    width: 26px;
    height: 26px;
  }
  .ai-avatar-inner {
    width: 14px;
    height: 14px;
    border-radius: 9999px;
    background: radial-gradient(circle at 30% 30%, #ffffff, rgba(255, 255, 255, 0.25));
  }
  .online-dot {
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
    animation: onlinePulse 2s ease-in-out infinite;
  }
  .chat-product-card {
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: #ffffff;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .chat-product-card:hover {
    transform: translateY(-2px);
    border-color: rgba(14, 165, 164, 0.45);
    box-shadow: 0 10px 18px rgba(15, 23, 42, 0.12);
  }
  .chat-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 9999px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    transition: all 0.2s ease;
  }
  .chat-chip:hover,
  .chat-chip:focus-visible {
    color: #0f766e;
    border-color: transparent;
    background: linear-gradient(#ffffff, #ffffff) padding-box,
      linear-gradient(120deg, #38bdf8, #34d399) border-box;
    box-shadow: 0 6px 16px rgba(14, 165, 164, 0.2);
  }
  .chat-input-shell {
    padding: 1px;
    border-radius: 9999px;
    background: linear-gradient(120deg, rgba(14, 165, 164, 0.5), rgba(56, 189, 248, 0.4));
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .chat-input-shell:focus-within {
    box-shadow: 0 0 0 3px rgba(14, 165, 164, 0.2), 0 12px 22px rgba(14, 165, 164, 0.18);
    transform: translateY(-1px);
  }
  .chat-input-body {
    border-radius: 9999px;
    background: #f1f5f9;
  }
  .ai-wave {
    display: inline-flex;
    align-items: flex-end;
    gap: 4px;
    height: 16px;
  }
  .ai-wave-bar {
    width: 4px;
    height: 12px;
    border-radius: 9999px;
    background: linear-gradient(180deg, #38bdf8, #14b8a6);
    animation: aiWave 1.2s ease-in-out infinite;
  }
  .ai-wave-bar:nth-child(2) {
    animation-delay: 0.15s;
  }
  .ai-wave-bar:nth-child(3) {
    animation-delay: 0.3s;
  }
  .chat-sample-card {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .chat-sample-card:hover,
  .chat-sample-card:focus-visible {
    transform: translateY(-2px);
    border-color: rgba(14, 165, 164, 0.45);
    box-shadow: 0 12px 22px rgba(15, 23, 42, 0.1);
  }
  @media (prefers-reduced-motion: reduce) {
    .chatbot-fab::before,
    .chatbot-fab::after,
    .orbit-dot,
    .chat-message,
    .ai-wave-bar,
    .chat-header::after,
    .chat-header,
    .online-dot,
    .chat-sample-card {
      animation: none !important;
      transition: none !important;
    }
  }
`;
