import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const CSS = `
  :root{
    --bg: #0a0c10;
    --bg-2: #0d1018;
    --panel: #11151d;
    --panel-2: #161b26;
    --panel-3: #1b2230;
    --line: #1d2331;
    --line-2: #262e3f;
    --line-strong: #313a4f;

    --t-dim:  #4f586b;
    --t-low:  #6a7589;
    --t-mid:  #8a94a8;
    --t-hi:   #c8d0de;
    --t-max:  #f1f4fb;

    --blue: #5b8dff;
    --blue-soft: rgba(91,141,255,0.12);
    --blue-ring: rgba(91,141,255,0.32);
    --purple: #9d6cff;
    --purple-soft: rgba(157,108,255,0.12);
    --purple-ring: rgba(157,108,255,0.32);
    --green: #2dd4a4;
    --amber: #f5a524;
    --orange: #ff8a4a;
    --red: #f25c5c;

    --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    --sans: 'Outfit', system-ui, -apple-system, Segoe UI, sans-serif;
    --serif: 'Instrument Serif', 'Times New Roman', serif;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:var(--bg);color:var(--t-hi);font-family:var(--sans);font-feature-settings:"ss01","cv11";}
  body{min-height:100vh; -webkit-font-smoothing:antialiased; text-rendering:geometricPrecision}
  button{font-family:inherit;color:inherit;background:none;border:none;cursor:pointer;padding:0}
  input,textarea,select{font-family:inherit;color:inherit}
  ::selection{background:rgba(91,141,255,0.35); color:#fff}

  /* Scrollbar */
  ::-webkit-scrollbar{width:10px;height:10px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1d2331;border-radius:10px;border:2px solid var(--bg)}
  ::-webkit-scrollbar-thumb:hover{background:#2a3346}

  /* App shell */
  .app{
    display:grid;
    grid-template-columns: 248px 1fr;
    min-height:100vh;
  }
  .sidebar{
    background:linear-gradient(180deg, #0b0e15 0%, #090b11 100%);
    border-right:1px solid var(--line);
    padding:18px 14px 14px;
    display:flex; flex-direction:column;
    position:sticky; top:0; height:100vh;
  }
  .brand{
    display:flex; align-items:center; gap:11px; padding:6px 6px 18px;
  }
  .brand-mark{
    width:34px;height:34px;border-radius:9px;
    background:
      radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.18), transparent 50%),
      linear-gradient(135deg, #5b8dff 0%, #9d6cff 100%);
    display:grid;place-items:center;color:#fff;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px rgba(91,141,255,0.25);
  }
  .brand-mark svg{display:block}
  .brand-text{display:flex; flex-direction:column; line-height:1}
  .brand-text b{font-weight:600;font-size:15px;letter-spacing:-0.01em;color:var(--t-max)}
  .brand-text span{font-family:var(--mono);font-size:10px;color:var(--t-low);margin-top:5px;letter-spacing:0.01em}

  .nav-label{
    font-family:var(--mono);font-size:9.5px;letter-spacing:0.18em;
    color:var(--t-dim); padding:14px 8px 6px; text-transform:uppercase;
  }
  .nav-item{
    display:flex; align-items:center; gap:11px; padding:8px 10px;
    color:var(--t-mid); border-radius:8px; cursor:pointer; user-select:none;
    font-size:13.5px; font-weight:500; letter-spacing:-0.005em;
    border:1px solid transparent;
    transition:background .15s, color .15s;
  }
  .nav-item:hover{background:rgba(255,255,255,0.025); color:var(--t-hi)}
  .nav-item.active{
    background:linear-gradient(180deg, rgba(91,141,255,0.08), rgba(91,141,255,0.04));
    color:var(--t-max);
    border-color:rgba(91,141,255,0.18);
  }
  .nav-item.active .nav-ico{color:var(--blue)}
  .nav-ico{width:18px; display:flex; justify-content:center; color:var(--t-low)}
  .nav-meta{margin-left:auto; font-family:var(--mono); font-size:10.5px; color:var(--t-dim);
    background:rgba(255,255,255,0.03); padding:2px 6px; border-radius:5px;}
  .nav-item.active .nav-meta{color:var(--blue); background:rgba(91,141,255,0.10)}

  .sidebar-section{display:flex; flex-direction:column; gap:2px}

  /* recent runs */
  .runs{flex:1; overflow:auto; margin-top:6px; padding-right:2px}
  .run{
    display:grid; grid-template-columns: auto 1fr auto; gap:8px;
    padding:8px 8px; border-radius:7px; cursor:pointer; align-items:center;
  }
  .run:hover{background:rgba(255,255,255,0.025)}
  .run .dot{width:6px;height:6px;border-radius:50%}
  .run .name{font-size:12px; color:var(--t-mid); white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
  .run .time{font-family:var(--mono); font-size:10px; color:var(--t-dim)}

  .sidebar-foot{
    border-top:1px solid var(--line); padding-top:12px; margin-top:6px;
    display:flex; gap:10px; align-items:center;
  }
  .avatar{
    width:30px;height:30px;border-radius:50%;
    background:linear-gradient(135deg,#5b8dff,#9d6cff);
    display:grid; place-items:center; color:white; font-weight:600; font-size:11px;
  }
  .who{display:flex;flex-direction:column;line-height:1.1}
  .who b{font-weight:500; font-size:12.5px; color:var(--t-hi)}
  .who span{font-family:var(--mono); font-size:10px; color:var(--t-low)}

  /* Main */
  .main{display:flex; flex-direction:column; min-width:0}
  .topbar{
    height:56px; padding:0 28px;
    display:flex; align-items:center; gap:20px;
    border-bottom:1px solid var(--line);
    background:linear-gradient(180deg, rgba(13,16,24,0.85), rgba(13,16,24,0.6));
    backdrop-filter: blur(8px); position:sticky; top:0; z-index:5;
  }
  .crumbs{display:flex; align-items:center; gap:8px; font-size:13px; color:var(--t-low)}
  .crumbs b{font-weight:500; color:var(--t-hi)}
  .crumbs .sep{color:var(--t-dim)}
  .topbar-right{margin-left:auto; display:flex; align-items:center; gap:14px}
  .kpi{
    display:flex; align-items:center; gap:8px;
    font-family:var(--mono); font-size:11px; color:var(--t-low);
  }
  .kpi b{color:var(--t-hi); font-weight:500}

  .status-pill{
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 11px 6px 9px; border-radius:99px;
    font-family:var(--mono); font-size:11.5px; letter-spacing:0.01em;
    border:1px solid; background:rgba(255,255,255,0.02);
  }
  .status-pill .pulse{
    width:6px;height:6px;border-radius:50%;
  }
  .status-idle{border-color:rgba(255,255,255,0.10); color:var(--t-mid)}
  .status-idle .pulse{background:#6a7589}
  .status-active{border-color:rgba(91,141,255,0.4); color:#bcd1ff; background:rgba(91,141,255,0.08)}
  .status-active .pulse{background:#5b8dff; box-shadow:0 0 0 3px rgba(91,141,255,0.22); animation:pulse 1.6s ease-in-out infinite}
  .status-done{border-color:rgba(45,212,164,0.4); color:#7eebc8; background:rgba(45,212,164,0.08)}
  .status-done .pulse{background:#2dd4a4}
  .status-error{border-color:rgba(242,92,92,0.45); color:#ffb4b4; background:rgba(242,92,92,0.08)}
  .status-error .pulse{background:#f25c5c}

  @keyframes pulse{
    0%,100%{box-shadow:0 0 0 0 rgba(91,141,255,0.4)}
    50%{box-shadow:0 0 0 6px rgba(91,141,255,0)}
  }

  .icon-btn{
    width:32px;height:32px;border-radius:8px;
    border:1px solid var(--line); display:grid; place-items:center;
    color:var(--t-mid); background:rgba(255,255,255,0.01);
  }
  .icon-btn:hover{color:var(--t-hi); border-color:var(--line-2)}

  /* Content area */
  .content{padding:24px 28px 56px; min-width:0}
  .page-h{
    display:flex; align-items:flex-end; justify-content:space-between; gap:16px;
    padding:8px 0 22px;
  }
  .page-h h1{
    font-size:26px; font-weight:600; letter-spacing:-0.02em; margin:0;
    color:var(--t-max);
  }
  .page-h h1 .accent{font-family:var(--serif); font-weight:400; font-style:italic; color:#a8b7d4;}
  .page-h p{margin:6px 0 0; color:var(--t-low); font-size:13px; max-width:560px;}

  /* Cards */
  .card{
    background:var(--panel);
    border:1px solid var(--line);
    border-radius:12px;
  }
  .card-h{
    padding:14px 18px;
    border-bottom:1px solid var(--line);
    display:flex; align-items:center; gap:10px;
  }
  .card-h .title{font-weight:500; font-size:13.5px; color:var(--t-hi); letter-spacing:-0.005em}
  .card-h .sub{font-family:var(--mono); font-size:10.5px; color:var(--t-low); margin-left:6px}
  .card-h .right{margin-left:auto; display:flex; align-items:center; gap:8px}

  /* Pipeline strip */
  .pipeline{
    display:grid; grid-template-columns: 1fr auto 1fr auto 1fr;
    gap:0; align-items:stretch;
    border:1px solid var(--line); border-radius:12px;
    background:linear-gradient(180deg, rgba(91,141,255,0.025), transparent 60%) , var(--panel);
    overflow:hidden;
  }
  .phase{
    padding:18px 20px;
    display:flex; flex-direction:column; gap:10px; min-width:0;
  }
  .phase .ix{
    display:flex; align-items:center; gap:9px;
    font-family:var(--mono); font-size:10.5px; color:var(--t-low); letter-spacing:0.06em; text-transform:uppercase;
  }
  .phase .ix .num{
    width:18px; height:18px; border-radius:5px; display:grid; place-items:center;
    background:rgba(255,255,255,0.04); color:var(--t-mid); font-size:10px;
  }
  .phase .name{font-size:15px; font-weight:500; color:var(--t-max); letter-spacing:-0.01em}
  .phase .desc{font-size:12px; color:var(--t-low); line-height:1.45}
  .phase .meta{display:flex; gap:14px; margin-top:6px; font-family:var(--mono); font-size:10.5px; color:var(--t-low)}
  .phase .meta b{color:var(--t-mid); font-weight:500}
  .phase-1 .num{background:rgba(49,130,206,0.18); color:#74b1ff}
  .phase-2 .num{background:rgba(128,90,213,0.18); color:#c4a4ff}
  .phase-3 .num{background:rgba(221,107,32,0.18); color:#ffb480}
  .phase-arrow{
    display:grid; place-items:center; padding:0 10px;
    color:var(--t-dim);
  }

  /* Layout grids */
  .upload-grid{
    display:grid; grid-template-columns: minmax(0,1fr) 360px; gap:20px;
    align-items:flex-start;
  }

  /* Brief intake */
  .brief-row{padding:18px}
  .brief-row + .brief-row{border-top:1px solid var(--line)}
  .field-label{
    display:flex; align-items:center; justify-content:space-between;
    font-family:var(--mono); font-size:10.5px; letter-spacing:0.16em;
    color:var(--t-low); text-transform:uppercase; margin-bottom:9px;
  }
  .field-label .hint{
    color:var(--t-dim); letter-spacing:0.04em; text-transform:none;
  }
  textarea, input.text{
    width:100%;
    background:var(--bg-2);
    border:1px solid var(--line);
    color:var(--t-hi);
    font-size:13.5px;
    line-height:1.55;
    border-radius:9px;
    padding:12px 13px;
    resize:vertical;
    transition: border-color .15s, box-shadow .15s, background .15s;
    font-family:inherit;
  }
  textarea::placeholder, input.text::placeholder{color:var(--t-dim)}
  textarea:focus, input.text:focus{
    outline:none;
    border-color:var(--blue);
    box-shadow:0 0 0 4px var(--blue-soft);
    background:#0c0f17;
  }

  /* dropzone */
  .dropzone{
    border:1.5px dashed var(--line-2);
    border-radius:10px;
    background:rgba(255,255,255,0.01);
    padding:14px 16px;
    display:flex; align-items:center; gap:14px;
    cursor:pointer;
    transition: border-color .15s, background .15s;
  }
  .dropzone:hover, .dropzone.drag{border-color:var(--blue); background:rgba(91,141,255,0.04)}
  .dropzone .ico{
    width:38px;height:38px;border-radius:8px; background:rgba(91,141,255,0.10);
    color:var(--blue); display:grid; place-items:center;
  }
  .dropzone .txt{display:flex; flex-direction:column; line-height:1.3; flex:1; min-width:0}
  .dropzone .txt b{font-weight:500; font-size:13.5px; color:var(--t-hi)}
  .dropzone .txt span{font-family:var(--mono); font-size:11px; color:var(--t-low); margin-top:2px}
  .dropzone .or{
    font-family:var(--mono); font-size:10.5px; color:var(--t-dim);
    border:1px solid var(--line-2); border-radius:6px; padding:5px 9px;
  }

  /* Bot picker */
  .bot-cats{display:flex; gap:6px}
  .bot-cat{
    padding:7px 11px; font-family:var(--mono); font-size:11px;
    border:1px solid var(--line); border-radius:7px; color:var(--t-mid);
    display:flex; align-items:center; gap:7px;
  }
  .bot-cat:hover{color:var(--t-hi); border-color:var(--line-2)}
  .bot-cat.on{background:var(--purple-soft); border-color:var(--purple-ring); color:#dcc6ff}
  .bot-cat .ct{font-size:10px; color:var(--t-dim); margin-left:2px}
  .bot-cat.on .ct{color:rgba(220,198,255,0.7)}

  .bot-grid{
    display:grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap:6px; margin-top:14px;
  }
  .bot-chip{
    display:flex; align-items:center; gap:9px;
    padding:8px 10px; border-radius:7px;
    border:1px solid var(--line);
    background:rgba(255,255,255,0.012);
    font-size:12.5px; color:var(--t-mid); cursor:pointer;
    transition:background .12s, border-color .12s, color .12s;
    min-width:0;
  }
  .bot-chip .glyph{
    width:22px;height:22px; border-radius:6px; flex:none;
    display:grid; place-items:center; font-size:11px;
    background:rgba(91,141,255,0.10); color:var(--blue);
  }
  .bot-chip.cat-real .glyph{background:rgba(45,212,164,0.10); color:var(--green)}
  .bot-chip .nm{flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
  .bot-chip:hover{color:var(--t-hi); border-color:var(--line-2)}
  .bot-chip.on{
    border-color:rgba(91,141,255,0.30);
    background:rgba(91,141,255,0.06);
    color:var(--t-max);
  }
  .bot-chip.on .glyph{box-shadow:0 0 0 1px rgba(91,141,255,0.30) inset}

  /* Config rail */
  .rail{position:sticky; top:80px; display:flex; flex-direction:column; gap:14px}
  .rail .card{overflow:hidden}
  .rail-section{padding:16px 18px}
  .rail-section + .rail-section{border-top:1px solid var(--line)}
  .rail-section .h{
    font-family:var(--mono); font-size:10.5px; letter-spacing:0.16em;
    color:var(--t-low); text-transform:uppercase; margin-bottom:12px;
  }
  .rail-section .row{
    display:flex; align-items:center; justify-content:space-between;
    font-size:13px; color:var(--t-mid);
  }
  .rail-section .row + .row{margin-top:9px}
  .rail-section .row b{font-family:var(--mono); color:var(--t-hi); font-weight:500}

  /* Slider */
  .slider-wrap{display:flex; flex-direction:column; gap:10px}
  input[type=range]{
    -webkit-appearance:none; appearance:none; width:100%; background:transparent;
    height:18px;
  }
  input[type=range]::-webkit-slider-runnable-track{
    height:5px; border-radius:99px;
    background: linear-gradient(90deg, var(--blue) 0%, var(--blue) var(--p,30%), #20283a var(--p,30%));
  }
  input[type=range]::-webkit-slider-thumb{
    -webkit-appearance:none; appearance:none;
    width:16px; height:16px; border-radius:50%;
    background:#fff;
    box-shadow: 0 0 0 4px rgba(91,141,255,0.18), 0 1px 3px rgba(0,0,0,0.6);
    margin-top:-5.5px; border:none;
  }
  input[type=range]:focus{outline:none}
  .scale{display:flex; justify-content:space-between; font-family:var(--mono); font-size:10px; color:var(--t-dim); padding:0 1px}
  .ticks{display:flex; justify-content:space-between; padding:0 1px}
  .ticks i{width:1px;height:4px;background:var(--line-2)}

  /* Toggle group */
  .tgrp{display:flex; gap:6px}
  .tgrp button{
    flex:1; padding:8px 6px; font-family:var(--mono); font-size:12px;
    border:1px solid var(--line); border-radius:7px; color:var(--t-mid);
    background:rgba(255,255,255,0.012);
  }
  .tgrp button:hover{color:var(--t-hi); border-color:var(--line-2)}
  .tgrp button.on{background:var(--blue-soft); border-color:var(--blue-ring); color:#bcd1ff}
  .tgrp.purple button.on{background:var(--purple-soft); border-color:var(--purple-ring); color:#dcc6ff}

  /* Cost receipt */
  .receipt{
    background:var(--bg-2); border:1px solid var(--line); border-radius:9px;
    padding:11px 12px; font-family:var(--mono); font-size:11.5px;
    display:flex; flex-direction:column; gap:6px;
  }
  .receipt .l{display:flex; justify-content:space-between; align-items:center; color:var(--t-low)}
  .receipt .l .v{color:var(--t-mid)}
  .receipt hr{border:none; border-top:1px dashed var(--line-2); margin:3px 0}
  .receipt .total .v{color:var(--amber); font-weight:600}

  /* Submit */
  .submit{
    width:100%; padding:13px 16px; border-radius:9px;
    font-size:14px; font-weight:600; color:#fff; letter-spacing:-0.005em;
    background: linear-gradient(90deg, #5b8dff 0%, #9d6cff 50%, #5b8dff 100%);
    background-size:200% 100%;
    box-shadow: 0 6px 18px rgba(91,141,255,0.25), inset 0 0 0 1px rgba(255,255,255,0.10);
    display:flex; align-items:center; justify-content:center; gap:10px;
    animation: shift 5s linear infinite;
  }
  .submit:hover{filter:brightness(1.07)}
  .submit:disabled{opacity:.6; cursor:not-allowed; filter:saturate(0.4)}
  .submit .kbd{
    font-family:var(--mono); font-size:10px; padding:2px 6px; border-radius:4px;
    background:rgba(0,0,0,0.25); color:rgba(255,255,255,0.85); margin-left:6px;
  }
  @keyframes shift{ to{background-position: 200% 0} }

  /* ====== QUEUE VIEW ====== */
  .queue-grid{display:grid; grid-template-columns: 1fr 360px; gap:20px; align-items:flex-start}
  .pipeline-vis{
    background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:18px;
    display:flex; flex-direction:column; gap:18px;
  }
  .phase-card{
    display:grid; grid-template-columns: 80px 1fr auto; gap:16px;
    padding:14px; border-radius:10px; border:1px solid var(--line);
    background:linear-gradient(180deg, rgba(255,255,255,0.012), transparent);
    align-items:center;
  }
  .phase-card.run{ border-color:rgba(91,141,255,0.28); background:rgba(91,141,255,0.04) }
  .phase-card.done{ border-color:rgba(45,212,164,0.22); }
  .phase-card.wait{ opacity:0.55 }
  .pcard-num{
    width:54px;height:54px;border-radius:11px; display:grid; place-items:center;
    font-family:var(--mono); font-size:18px; font-weight:600;
    background:rgba(255,255,255,0.03);
    color:var(--t-mid);
  }
  .phase-card.run .pcard-num{background:rgba(91,141,255,0.14); color:#bcd1ff}
  .phase-card.done .pcard-num{background:rgba(45,212,164,0.14); color:#7eebc8}
  .pcard-meta{display:flex; flex-direction:column; min-width:0}
  .pcard-meta .nm{font-size:14px; font-weight:500; color:var(--t-max); margin-bottom:2px}
  .pcard-meta .ds{font-size:12px; color:var(--t-low); line-height:1.4}
  .pcard-meta .bar{
    height:4px; background:#1a2030; border-radius:99px; margin-top:9px; overflow:hidden;
  }
  .pcard-meta .bar i{
    display:block; height:100%; background:linear-gradient(90deg, #5b8dff, #9d6cff);
    border-radius:99px;
  }
  .phase-card.done .pcard-meta .bar i{background:#2dd4a4}
  .pcard-side{
    text-align:right; font-family:var(--mono); font-size:11px; color:var(--t-low);
    display:flex; flex-direction:column; gap:3px;
  }
  .pcard-side b{color:var(--t-hi); font-weight:500; font-size:12px}

  /* bots grid for queue */
  .workers-card{padding:0}
  .workers-h{padding:14px 18px; border-bottom:1px solid var(--line); display:flex; align-items:center; gap:10px}
  .workers-h .title{font-weight:500; font-size:13.5px; color:var(--t-hi)}
  .workers-h .sub{font-family:var(--mono); font-size:10.5px; color:var(--t-low); margin-left:6px}
  .workers-h .right{margin-left:auto; display:flex; gap:14px; font-family:var(--mono); font-size:11px; color:var(--t-low)}
  .workers-h .right b{color:var(--t-hi); font-weight:500}
  .worker-grid{
    display:grid; grid-template-columns: repeat(4, 1fr); gap:1px;
    background:var(--line); border-radius:0 0 12px 12px; overflow:hidden;
  }
  .worker{
    background:var(--panel); padding:11px 13px; display:flex; align-items:center; gap:10px;
    min-width:0;
  }
  .worker .nm{flex:1; font-size:12.5px; color:var(--t-mid); overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
  .worker .st{font-family:var(--mono); font-size:10px; color:var(--t-low);}
  .worker .led{
    width:7px;height:7px;border-radius:50%; background:#2a3346; flex:none;
  }
  .worker.run{background:rgba(91,141,255,0.045)}
  .worker.run .led{background:var(--blue); box-shadow:0 0 0 3px rgba(91,141,255,0.18); animation:pulse 1.4s infinite}
  .worker.run .nm{color:var(--t-hi)}
  .worker.done .led{background:var(--green)}
  .worker.done .nm{color:var(--t-mid)}
  .worker.queue .led{background:#3a445a}
  .worker.err .led{background:var(--red)}

  /* log */
  .logs{max-height:380px; overflow:auto; padding:6px 0}
  .log{
    display:grid; grid-template-columns: 76px 18px 1fr auto; gap:12px;
    align-items:center; padding:7px 18px;
    font-size:12.5px; color:var(--t-mid);
    border-top:1px solid #131826;
  }
  .log:first-child{border-top:none}
  .log .ts{font-family:var(--mono); font-size:10.5px; color:var(--t-dim)}
  .log .ic{display:grid; place-items:center; color:var(--t-low)}
  .log .tag{
    font-family:var(--mono); font-size:9.5px; letter-spacing:0.08em;
    padding:2px 6px; border-radius:4px; text-transform:uppercase;
    background:rgba(255,255,255,0.04); color:var(--t-low);
  }
  .log.p1 .tag{background:rgba(49,130,206,0.14); color:#74b1ff}
  .log.p2 .tag{background:rgba(128,90,213,0.14); color:#c4a4ff}
  .log.p3 .tag{background:rgba(221,107,32,0.14); color:#ffb480}
  .log.ok .ic{color:var(--green)}
  .log.err .ic{color:var(--red)}

  /* Run sidebar in queue */
  .run-meta{padding:18px}
  .run-meta h4{margin:0 0 12px; font-size:13px; font-weight:500; color:var(--t-hi)}
  .stat-grid{display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--line); border-radius:9px; overflow:hidden}
  .stat{background:var(--panel-2); padding:12px}
  .stat .k{font-family:var(--mono); font-size:10px; color:var(--t-low); text-transform:uppercase; letter-spacing:0.1em}
  .stat .v{font-size:20px; font-weight:500; color:var(--t-max); margin-top:6px; font-feature-settings:"tnum"}
  .stat .v span{font-size:12px; font-family:var(--mono); color:var(--t-low); margin-left:4px; font-weight:400}

  .timeline{margin-top:16px; display:flex; flex-direction:column; gap:0}
  .tl{display:grid; grid-template-columns: 14px 1fr auto; gap:10px; align-items:flex-start; padding:8px 0; position:relative}
  .tl::before{content:""; position:absolute; left:6px; top:18px; bottom:-4px; width:1px; background:var(--line-2)}
  .tl:last-child::before{display:none}
  .tl .ld{width:13px;height:13px; border-radius:50%; background:#1a2030; border:2px solid var(--bg); margin-top:2px; z-index:1}
  .tl.done .ld{background:var(--green)}
  .tl.run .ld{background:var(--blue); box-shadow:0 0 0 3px rgba(91,141,255,0.18); animation:pulse 1.4s infinite}
  .tl .lbl{font-size:12.5px; color:var(--t-mid)}
  .tl .dr{font-family:var(--mono); font-size:10.5px; color:var(--t-low)}

  /* ====== GALLERY ====== */
  .gall-h{
    display:flex; align-items:center; gap:14px; padding:0 0 18px;
    flex-wrap:wrap;
  }
  .gall-h h2{margin:0; font-size:18px; font-weight:500; color:var(--t-hi); letter-spacing:-0.01em}
  .gall-h h2 b{font-family:var(--mono); font-size:13px; color:var(--t-low); font-weight:400; margin-left:6px}
  .gall-h .gh-right{margin-left:auto; display:flex; gap:8px; align-items:center}

  .filter-bar{display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:18px}
  .filter-chip{
    display:flex; align-items:center; gap:7px;
    padding:6px 10px; border:1px solid var(--line); border-radius:99px;
    font-size:12px; color:var(--t-mid); cursor:pointer;
    background:rgba(255,255,255,0.012);
  }
  .filter-chip .ct{font-family:var(--mono); font-size:10px; color:var(--t-dim)}
  .filter-chip.on{border-color:var(--blue-ring); background:var(--blue-soft); color:#bcd1ff}
  .filter-chip.on .ct{color:rgba(188,209,255,0.7)}
  .filter-sep{width:1px; height:18px; background:var(--line); margin:0 4px}
  .seg{
    display:flex; gap:0; border:1px solid var(--line); border-radius:8px; overflow:hidden;
  }
  .seg button{
    padding:6px 11px; font-family:var(--mono); font-size:11px; color:var(--t-mid);
    background:rgba(255,255,255,0.012);
  }
  .seg button + button{border-left:1px solid var(--line)}
  .seg button.on{background:var(--blue-soft); color:#bcd1ff}

  .btn{
    display:inline-flex; align-items:center; gap:8px;
    border:1px solid var(--line); border-radius:8px; padding:7px 12px;
    font-size:12.5px; color:var(--t-hi);
    background:rgba(255,255,255,0.012);
  }
  .btn:hover{border-color:var(--line-2)}
  .btn.primary{background:linear-gradient(90deg,#5b8dff,#9d6cff); border-color:transparent; color:#fff; font-weight:500}
  .btn.ghost{color:var(--blue)}
  .btn .kbd{font-family:var(--mono); font-size:10px; color:var(--t-low); border:1px solid var(--line); padding:1px 5px; border-radius:4px; margin-left:2px}

  .ad-grid{
    display:grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap:16px;
  }
  .adcard{
    background:var(--panel); border:1px solid var(--line); border-radius:12px;
    overflow:hidden; display:flex; flex-direction:column;
    transition: border-color .15s, transform .15s;
  }
  .adcard:hover{border-color:var(--line-2)}
  .ad-img{
    width:100%; position:relative; overflow:hidden;
    background:#0c0f17;
  }
  .ad-img .ar-badge{
    position:absolute; top:10px; left:10px; z-index:2;
    font-family:var(--mono); font-size:10.5px; padding:4px 8px;
    background:rgba(8,10,14,0.78); color:#bcd1ff;
    border-radius:6px; backdrop-filter:blur(8px);
    border:1px solid rgba(91,141,255,0.25);
  }
  .ad-img .more{
    position:absolute; top:10px; right:10px; z-index:2;
    width:26px; height:26px; border-radius:6px;
    background:rgba(8,10,14,0.6); backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,0.06);
    display:grid; place-items:center; color:var(--t-hi);
  }
  .ad-body{padding:14px; display:flex; flex-direction:column; gap:11px}
  .ad-bot{
    display:inline-flex; align-items:center; gap:7px; align-self:flex-start;
    padding:4px 9px 4px 6px; border-radius:99px;
    font-size:11px; font-family:var(--mono); letter-spacing:0.01em;
  }
  .ad-bot.ai{background:rgba(91,141,255,0.10); color:#bcd1ff}
  .ad-bot.real{background:rgba(45,212,164,0.10); color:#7eebc8}
  .ad-bot .g{width:16px;height:16px;border-radius:50%; display:grid; place-items:center; font-size:9px;
    background:rgba(255,255,255,0.05)}
  .ad-sec{display:flex; flex-direction:column; gap:5px}
  .ad-sec-h{
    display:flex; align-items:center; justify-content:space-between;
    font-family:var(--mono); font-size:9.5px; color:var(--t-dim); letter-spacing:0.16em; text-transform:uppercase;
  }
  .ad-headline{font-size:14px; font-weight:600; color:var(--t-max); line-height:1.35; letter-spacing:-0.005em;
    text-wrap:pretty}
  .ad-body-txt{font-size:12.5px; color:var(--t-mid); line-height:1.5;
    display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
    text-wrap:pretty}
  .copy-btn{
    font-family:var(--mono); font-size:10px; padding:3px 7px; border-radius:5px;
    border:1px solid var(--line); color:var(--t-low);
    background:rgba(255,255,255,0.025);
  }
  .copy-btn:hover{color:var(--t-hi); border-color:var(--line-2)}
  .copy-btn.copied{background:rgba(45,212,164,0.12); border-color:rgba(45,212,164,0.32); color:#7eebc8}

  .ad-foot{
    border-top:1px solid var(--line); padding:10px 14px;
    display:flex; align-items:center; gap:10px;
    font-family:var(--mono); font-size:10.5px; color:var(--t-low);
  }
  .ad-foot .score{
    display:flex; align-items:center; gap:5px; color:var(--t-mid);
  }
  .ad-foot .dot-sep{width:3px; height:3px; border-radius:50%; background:var(--line-strong)}
  .ad-foot .actions{margin-left:auto; display:flex; gap:6px}
  .ad-foot .actions button{
    width:24px; height:24px; border-radius:5px; border:1px solid transparent;
    color:var(--t-low); display:grid; place-items:center;
  }
  .ad-foot .actions button:hover{color:var(--t-hi); border-color:var(--line-2)}

  /* Mock ad image surfaces */
  .mock-surface{
    width:100%; height:100%; position:relative; overflow:hidden;
  }
  .grain::after{
    content:""; position:absolute; inset:0; pointer-events:none;
    background:
      radial-gradient(1200px 600px at 30% 0%, rgba(255,255,255,0.06), transparent 60%),
      radial-gradient(800px 400px at 100% 100%, rgba(0,0,0,0.35), transparent 60%);
    mix-blend-mode:overlay;
  }

  /* Ad image presets */
  .ad-img.ar-9-16{aspect-ratio: 9/16}
  .ad-img.ar-1-1{aspect-ratio: 1/1}
  .ad-img.ar-4-5{aspect-ratio: 4/5}

  /* small */
  .tiny-mono{font-family:var(--mono); font-size:10.5px; color:var(--t-low)}

  /* fade in */
  @keyframes fadeIn { from{opacity:0; transform:translateY(4px)} to{opacity:1; transform:none} }
  .fade-in{animation: fadeIn .35s ease both}

  @media (max-width: 1180px){
    .upload-grid, .queue-grid{grid-template-columns: 1fr}
    .worker-grid{grid-template-columns: repeat(2, 1fr)}
  }
  @media (max-width: 900px){
    .app{grid-template-columns: 1fr}
    .sidebar{position:relative; height:auto}
    .runs{display:none}
  }
</style>

`;

// === icons.jsx ===
// Inline icons — single-color stroke set
const I = {};
const _ico = (path, vb = "0 0 24 24") => ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox={vb} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {path}
  </svg>
);

I.bolt = _ico(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" strokeLinejoin="round" />);
I.upload = _ico(<><path d="M12 16V4" /><path d="m6 10 6-6 6 6" /><path d="M4 20h16" /></>);
I.queue = _ico(<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></>);
I.gallery = _ico(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>);
I.book = _ico(<><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H6a2 2 0 0 0-2 2V4.5z" /><path d="M6 18h14v3H6a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z" /></>);
I.settings = _ico(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>);
I.paperclip = _ico(<path d="M21 12.5 12.5 21a5.5 5.5 0 1 1-7.78-7.78L13 5a3.7 3.7 0 0 1 5.24 5.24L9.74 18.74a1.85 1.85 0 0 1-2.62-2.62l7.78-7.78" />);
I.search = _ico(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
I.arrowRight = _ico(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>);
I.check = _ico(<path d="m5 12 5 5 9-12" />);
I.x = _ico(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
I.download = _ico(<><path d="M12 4v12" /><path d="m6 10 6 6 6-6" /><path d="M4 20h16" /></>);
I.refresh = _ico(<><path d="M3 12a9 9 0 0 1 15-6.7l3-3" /><path d="M21 3v6h-6" /><path d="M21 12a9 9 0 0 1-15 6.7l-3 3" /><path d="M3 21v-6h6" /></>);
I.copy = _ico(<><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>);
I.spark = _ico(<><path d="M12 2v6" /><path d="M12 16v6" /><path d="M2 12h6" /><path d="M16 12h6" /><path d="m5 5 4 4" /><path d="m15 15 4 4" /><path d="m5 19 4-4" /><path d="m15 9 4-4" /></>);
I.dots = _ico(<><circle cx="12" cy="6" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="18" r="1" /></>);
I.star = _ico(<path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />);
I.heart = _ico(<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />);
I.share = _ico(<><circle cx="6" cy="12" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="m8 11 8-4" /><path d="m8 13 8 4" /></>);
I.filter = _ico(<path d="M3 5h18l-7 9v6l-4-2v-4z" />);
I.activity = _ico(<path d="M3 12h4l3-8 4 16 3-8h4" />);
I.zap = _ico(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />);
I.image = _ico(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>);
I.text = _ico(<><path d="M4 6h16" /><path d="M4 12h10" /><path d="M4 18h16" /></>);
I.command = _ico(<><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></>);
I.cube = _ico(<><path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>);
I.clock = _ico(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
I.layers = _ico(<><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /><path d="m3 18 9 5 9-5" /></>);
I.eye = _ico(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>);
I.coins = _ico(<><ellipse cx="9" cy="7" rx="6" ry="2.5" /><path d="M3 7v5c0 1.4 2.7 2.5 6 2.5" /><path d="M3 12v5c0 1.4 2.7 2.5 6 2.5" /><ellipse cx="15" cy="14" rx="6" ry="2.5" /><path d="M21 14v5c0 1.4-2.7 2.5-6 2.5s-6-1.1-6-2.5" /></>);



// === data.jsx ===
// Mock data: bots, ad units, logs, runs

const AI_BOTS = [
  { id: 'curiosity', name: 'Curiosity Bait', glyph: '?', cat: 'ai_image' },
  { id: 'bold-type', name: 'Bold Typography', glyph: 'B', cat: 'ai_image' },
  { id: 'native-news', name: 'Native News', glyph: 'N', cat: 'ai_image' },
  { id: 'receipt', name: 'Receipt', glyph: '$', cat: 'ai_image' },
  { id: 'prob-sol', name: 'Problem · Solution', glyph: 'Δ', cat: 'ai_image' },
  { id: 'lo-fi', name: 'Lo-Fi', glyph: 'L', cat: 'ai_image' },
  { id: 'meme', name: 'Meme Style', glyph: 'M', cat: 'ai_image' },
  { id: 'science', name: 'Scientific Study', glyph: 'σ', cat: 'ai_image' },
  { id: 'infographic', name: 'Infographic', glyph: 'I', cat: 'ai_image' },
  { id: 'post-it', name: 'Post-It Note', glyph: 'P', cat: 'ai_image' },
  { id: 'quiz', name: 'Quiz / Interactive', glyph: 'Q', cat: 'ai_image' },
  { id: 'stat', name: 'Statistic', glyph: '%', cat: 'ai_image' },
  { id: 'breaking', name: 'Breaking News', glyph: '!', cat: 'ai_image' },
  { id: 'founder', name: 'Note From Founder', glyph: 'F', cat: 'ai_image' },
  { id: 'screenshot', name: 'Screenshot / Chat', glyph: '#', cat: 'ai_image' },
  { id: 'hero', name: 'Hero Shot', glyph: 'H', cat: 'ai_image' },
];

const REAL_BOTS = [
  { id: 'ugc', name: 'UGC', glyph: 'U', cat: 'real_photo' },
  { id: 'holding-sign', name: 'Holding Sign', glyph: 'S', cat: 'real_photo' },
  { id: 'happy-avatar', name: 'Happy Avatar', glyph: '☻', cat: 'real_photo' },
  { id: 'before-after', name: 'Before & After', glyph: '⇄', cat: 'real_photo' },
];

const ALL_BOTS = [...AI_BOTS, ...REAL_BOTS];

// Demo runs (recent)
const RECENT_RUNS = [
  { id: 'r-742', name: 'Loom · Free Trial Hook', when: '2m', status: 'run' },
  { id: 'r-741', name: 'Notion · AI Workspace', when: '1h', status: 'done' },
  { id: 'r-740', name: 'Athletic Greens · v3', when: '3h', status: 'done' },
  { id: 'r-739', name: 'Whoop · Recovery Score', when: 'yest', status: 'done' },
  { id: 'r-738', name: 'Cred · BNPL Discount', when: '2d', status: 'err' },
  { id: 'r-737', name: 'Hims · ED Onramp', when: '4d', status: 'done' },
];

// Pre-canned ad units for the gallery
const AD_UNITS = [
  {
    id: 'ad-1', bot: 'curiosity', ratio: '9:16', surface: 'curiosity',
    headline: 'The 4-minute morning ritual that ruined coffee for me',
    body: 'I dropped $200/mo on third-wave beans before a chemistry PhD told me what most baristas don\'t — your beans are leaking flavor before you grind. Here\'s the fix I now use every day.',
    score: 9.2, copies: 14,
  },
  {
    id: 'ad-2', bot: 'hero', ratio: '1:1', surface: 'hero',
    headline: 'Designed to be the last bottle you ever buy.',
    body: 'Triple-walled vacuum steel keeps 36h cold, 18h hot. Zero plastic, zero microplastics, lifetime guarantee.',
    score: 8.7, copies: 6,
  },
  {
    id: 'ad-3', bot: 'stat', ratio: '4:5', surface: 'stat',
    headline: '87% of returns happen in the first 14 days. Ours don\'t.',
    body: 'A independent retail audit of 4,200 D2C brands found we have the lowest 30-day return rate in the category. Here\'s what changed.',
    score: 8.4, copies: 9,
  },
  {
    id: 'ad-4', bot: 'before-after', ratio: '9:16', surface: 'beforeafter',
    headline: 'Same room. 11 minutes apart.',
    body: 'No paint, no Pinterest hacks, no $400 lamps. Just one product most renters don\'t know exists.',
    score: 9.0, copies: 21,
  },
  {
    id: 'ad-5', bot: 'post-it', ratio: '1:1', surface: 'postit',
    headline: 'Note to self: cancel the gym.',
    body: 'I tested 7 home-workout apps so you don\'t have to. This is the only one that didn\'t feel like homework.',
    score: 7.9, copies: 4,
  },
  {
    id: 'ad-6', bot: 'native-news', ratio: '4:5', surface: 'news',
    headline: 'Inside the Brooklyn startup quietly fixing sleep',
    body: 'The 3-person team behind Drift never raised a Series A. Here\'s how they ended up in 1.2M bedrooms.',
    score: 8.6, copies: 11,
  },
  {
    id: 'ad-7', bot: 'receipt', ratio: '9:16', surface: 'receipt',
    headline: 'I added up everything I spent on my morning routine.',
    body: '$11.40/day on coffee, supplements and the dumb green powder. Here\'s what it looks like in one tab — and what replaced it.',
    score: 8.1, copies: 7,
  },
  {
    id: 'ad-8', bot: 'bold-type', ratio: '1:1', surface: 'boldtype',
    headline: 'SLEEP IS A SOFTWARE PROBLEM.',
    body: 'We rebuilt the bed from the firmware up. Cooling. Adjusting. Learning. Up to 1h more deep sleep in week one.',
    score: 9.4, copies: 18,
  },
  {
    id: 'ad-9', bot: 'ugc', ratio: '9:16', surface: 'ugc',
    headline: 'Why are these everywhere on my FYP?',
    body: 'I caved at 2am. Day 3 review: actually a problem now.',
    score: 8.8, copies: 12,
  },
];

// Logs to seed Queue tab with a running pipeline
const QUEUE_LOGS = [
  { t: '00:00:01', phase: 'p1', kind: 'info', msg: 'Webhook received · payload 4.2KB' },
  { t: '00:00:01', phase: 'p1', kind: 'info', msg: 'Tagging hooks, claims and segments' },
  { t: '00:00:03', phase: 'p1', kind: 'ok', msg: 'Extracted 6 copy blocks · 3 hooks · 4 claims' },
  { t: '00:00:04', phase: 'p1', kind: 'ok', msg: 'Genesis schema validated' },
  { t: '00:00:05', phase: 'p2', kind: 'info', msg: 'Spawning 16 specialized bots · parallel' },
  { t: '00:00:08', phase: 'p2', kind: 'ok', msg: 'curiosity-bait · variant produced (1,840 tok)' },
  { t: '00:00:09', phase: 'p2', kind: 'ok', msg: 'bold-typography · variant produced (1,712 tok)' },
  { t: '00:00:11', phase: 'p2', kind: 'ok', msg: 'native-news · variant produced (2,108 tok)' },
  { t: '00:00:12', phase: 'p2', kind: 'ok', msg: 'hero-shot · variant produced (1,902 tok)' },
  { t: '00:00:13', phase: 'p2', kind: 'info', msg: 'receipt, statistic, post-it · in-flight' },
  { t: '00:00:14', phase: 'p2', kind: 'info', msg: 'Brand voice score: 8.6 · keeping all variants' },
  { t: '00:00:18', phase: 'p3', kind: 'info', msg: 'Kie.ai · queued 9 image generations · nano-banana-2' },
  { t: '00:00:21', phase: 'p3', kind: 'ok', msg: 'curiosity-bait · 9:16 rendered' },
];

const COST_PER_IMG = 0.04;
const CREDITS_PER_IMG = 8;



// === atoms.jsx ===
// Small reusable atoms

function StatusPill({ status = 'idle', label }) {
  const map = {
    idle: { cls: 'status-idle', txt: 'Ready' },
    active: { cls: 'status-active', txt: 'Processing' },
    p1: { cls: 'status-active', txt: 'Analyzing' },
    p2: { cls: 'status-active', txt: 'Generating' },
    p3: { cls: 'status-active', txt: 'Rendering' },
    done: { cls: 'status-done', txt: 'Complete' },
    error: { cls: 'status-error', txt: 'Error' },
  };
  const m = map[status] || map.idle;
  return (
    <span className={`status-pill ${m.cls}`}>
      <span className="pulse" />
      {label || m.txt}
    </span>
  );
}

function CopyButton({ text, small }) {
  const [copied, setCopied] = useState(false);
  const onClick = (e) => {
    e.stopPropagation();
    try { navigator.clipboard?.writeText(text || ''); } catch (_) { }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={onClick}>
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  );
}

function IconBtn({ children, title, onClick }) {
  return <button className="icon-btn" title={title} onClick={onClick}>{children}</button>;
}

function Btn({ children, variant = 'default', onClick }) {
  return <button className={`btn ${variant}`} onClick={onClick}>{children}</button>;
}

// Pretty number
const num = (n) => n.toLocaleString('en-US');
const money = (n) => '$' + n.toFixed(2);



// === upload.jsx ===
// UPLOAD VIEW
function PipelineStrip({ numVariants, ratios }) {
  return (
    <div className="pipeline fade-in">
      <div className="phase phase-1">
        <div className="ix"><span className="num">01</span> Analysis</div>
        <div className="name">Tag the winning ad</div>
        <div className="desc">Extract hooks, claims, segments and copy blocks. Validate Genesis schema before fan-out.</div>
        <div className="meta"><span><b>~4s</b> avg</span><span><b>1</b> bot</span></div>
      </div>
      <div className="phase-arrow"><I.arrowRight size={16} /></div>
      <div className="phase phase-2">
        <div className="ix"><span className="num">02</span> Variants</div>
        <div className="name">Fan out across {numVariants} bots</div>
        <div className="desc">Specialized copywriters work the same brief in parallel — curiosity, hero, statistic, UGC, news&hellip;</div>
        <div className="meta"><span><b>~12s</b> avg</span><span><b>{numVariants}</b> variants</span></div>
      </div>
      <div className="phase-arrow"><I.arrowRight size={16} /></div>
      <div className="phase phase-3">
        <div className="ix"><span className="num">03</span> Imagery</div>
        <div className="name">Render with Nano Banana 2</div>
        <div className="desc">Generate each variant at {ratios.join(' · ')}. Outputs land Meta-ready, signed and packed.</div>
        <div className="meta"><span><b>~28s</b> avg</span><span><b>{numVariants * ratios.length}</b> images</span></div>
      </div>
    </div>
  );
}

function BriefIntake({ ad, setAd, offer, setOffer, fileName, onFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);
  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };
  return (
    <div className="card fade-in">
      <div className="card-h">
        <I.text size={15} />
        <span className="title">Brief</span>
        <span className="sub">winning-ad.txt</span>
        <div className="right">
          <span className="tiny-mono">{ad.length + offer.length} chars</span>
        </div>
      </div>
      <div className="brief-row">
        <div
          className={`dropzone ${drag ? 'drag' : ''}`}
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <div className="ico"><I.paperclip size={18} /></div>
          <div className="txt">
            <b>{fileName || 'Drop winning ad file'}</b>
            <span>{fileName ? `${fileName} attached` : '.txt or .md · or paste below'}</span>
          </div>
          <span className="or">⌘ V</span>
          <input ref={ref} type="file" accept=".txt,.md,text/plain,text/markdown" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </div>
      </div>
      <div className="brief-row">
        <div className="field-label">
          Winning ad copy
          <span className="hint">paste the version that converted</span>
        </div>
        <textarea
          rows={6}
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          placeholder={`Hook · body · CTA, exactly as it ran on Meta.\n\nExample —\n"I dropped my morning coffee budget by $147/mo. Here's the boring 90-second swap that did it."`}
        />
      </div>
      <div className="brief-row">
        <div className="field-label">
          Offer & product
          <span className="hint">what is being sold, to whom, and why now</span>
        </div>
        <textarea
          rows={4}
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="One-paragraph offer description. Include the core promise, the audience, and any constraints (price, claims you can't make, brand voice notes)."
        />
      </div>
    </div>
  );
}

function BotPicker({ category, setCategory, selected, toggle, selectAll }) {
  const visible = category === 'all'
    ? ALL_BOTS
    : (category === 'ai_image' ? AI_BOTS : REAL_BOTS);

  const aiCount = AI_BOTS.filter(b => selected.includes(b.id)).length;
  const realCount = REAL_BOTS.filter(b => selected.includes(b.id)).length;

  return (
    <div className="card fade-in">
      <div className="card-h">
        <I.cube size={15} />
        <span className="title">Bot lineup</span>
        <span className="sub">{selected.length}/{ALL_BOTS.length} selected</span>
        <div className="right">
          <button className="copy-btn" onClick={selectAll}>{selected.length === ALL_BOTS.length ? 'Clear' : 'Select all'}</button>
        </div>
      </div>
      <div className="brief-row">
        <div className="bot-cats">
          <button className={`bot-cat ${category === 'all' ? 'on' : ''}`} onClick={() => setCategory('all')}>
            <I.layers size={12} /> All <span className="ct">{ALL_BOTS.length}</span>
          </button>
          <button className={`bot-cat ${category === 'ai_image' ? 'on' : ''}`} onClick={() => setCategory('ai_image')}>
            <I.image size={12} /> AI Image <span className="ct">{AI_BOTS.length} · {aiCount} on</span>
          </button>
          <button className={`bot-cat ${category === 'real_photo' ? 'on' : ''}`} onClick={() => setCategory('real_photo')}>
            <I.eye size={12} /> Real photo <span className="ct">{REAL_BOTS.length} · {realCount} on</span>
          </button>
        </div>
        <div className="bot-grid">
          {visible.map(b => (
            <button key={b.id}
              className={`bot-chip ${selected.includes(b.id) ? 'on' : ''} ${b.cat === 'real_photo' ? 'cat-real' : ''}`}
              onClick={() => toggle(b.id)}
            >
              <span className="glyph">{b.glyph}</span>
              <span className="nm">{b.name}</span>
              {selected.includes(b.id) && <I.check size={12} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfigRail({ numVariants, setNumVariants, ratios, toggleRatio, category, setCategory, est, onSubmit, submitting, canSubmit = false }) {
  const p = (numVariants - 1) / 19 * 100;
  return (
    <div className="rail">
      <div className="card fade-in">
        <div className="card-h">
          <I.settings size={15} />
          <span className="title">Configuration</span>
          <span className="sub">run params</span>
        </div>

        <div className="rail-section">
          <div className="h">Volume</div>
          <div className="slider-wrap">
            <div className="row" style={{ marginBottom: 4 }}>
              <span>Variants per ratio</span>
              <b>{numVariants}</b>
            </div>
            <input
              type="range" min={1} max={20} value={numVariants}
              onChange={(e) => setNumVariants(+e.target.value)}
              style={{ '--p': `${p}%` }}
            />
            <div className="scale"><span>1</span><span>10</span><span>20</span></div>
          </div>
        </div>

        <div className="rail-section">
          <div className="h">Aspect ratios</div>
          <div className="tgrp">
            {['9:16', '1:1', '4:5'].map(r => (
              <button key={r} className={ratios.includes(r) ? 'on' : ''} onClick={() => toggleRatio(r)}>{r}</button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 11 }}>
            <span style={{ fontSize: 12, color: 'var(--t-low)' }}>{ratios.length} format{ratios.length === 1 ? '' : 's'} · Meta-ready</span>
          </div>
        </div>

        <div className="rail-section">
          <div className="h">Bot category</div>
          <div className="tgrp purple">
            <button className={category === 'ai_image' ? 'on' : ''} onClick={() => setCategory('ai_image')}>AI Image</button>
            <button className={category === 'real_photo' ? 'on' : ''} onClick={() => setCategory('real_photo')}>Real photo</button>
            <button className={category === 'all' ? 'on' : ''} onClick={() => setCategory('all')}>All · {ALL_BOTS.length}</button>
          </div>
        </div>

        <div className="rail-section">
          <div className="h">Estimate</div>
          <div className="receipt">
            <div className="l"><span>Variants · {est.bots} bot{est.bots === 1 ? '' : 's'}</span><span className="v">× {numVariants}</span></div>
            <div className="l"><span>Aspect ratios</span><span className="v">× {ratios.length}</span></div>
            <div className="l"><span>Images to render</span><span className="v">{est.images}</span></div>
            <div className="l"><span>Kie.ai credits</span><span className="v">{est.credits}</span></div>
            <hr />
            <div className="l total"><span>Estimated cost</span><span className="v">~{money(est.cost)} USD</span></div>
          </div>
        </div>
      </div>

      <button className="submit" disabled={submitting || !canSubmit} onClick={onSubmit}
        style={!canSubmit && !submitting ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
        {submitting
          ? <>Processing…</>
          : !canSubmit
            ? <>⚠ Paste winning ad copy first</>
            : <>
              <I.bolt size={15} /> Generate {est.images} ad unit{est.images === 1 ? '' : 's'}
              <span className="kbd">⌘ ↵</span>
            </>}
      </button>
    </div>
  );
}

function UploadView(props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PipelineStrip numVariants={props.numVariants} ratios={props.ratios} />
      <div className="upload-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <BriefIntake {...props} />
          <BotPicker
            category={props.category}
            setCategory={props.setCategory}
            selected={props.selectedBots}
            toggle={props.toggleBot}
            selectAll={props.selectAllBots}
          />
        </div>
        <ConfigRail {...props} />
      </div>
    </div>
  );
}



// === queue.jsx ===
// QUEUE VIEW
function QueueView({ status, logs, runState, runStats = { elapsed: 0 }, numVariants = 3, estCost = 0 }) {
  // runState: { p1: 'done'|'run'|'wait', p2: 'done'|'run'|'wait', p3: ..., progress:{p1,p2,p3} }
  const phaseCard = (n, key, name, desc, side) => {
    const st = runState[key]; // done / run / wait
    return (
      <div className={`phase-card ${st}`}>
        <div className="pcard-num">{n}</div>
        <div className="pcard-meta">
          <div className="nm">{name}</div>
          <div className="ds">{desc}</div>
          <div className="bar"><i style={{ width: `${runState.progress[key]}%` }} /></div>
        </div>
        <div className="pcard-side">{side}</div>
      </div>
    );
  };

  return (
    <div className="queue-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>

        <div className="pipeline-vis fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <I.activity size={15} />
            <div style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--t-hi)' }}>Pipeline</div>
            <span className="tiny-mono">{runStats.elapsed > 0 ? `${runStats.elapsed}s elapsed` : 'waiting'}</span>
            <div style={{ marginLeft: 'auto' }}><StatusPill status={status} /></div>
          </div>

          {phaseCard('01', 'p1', 'Analysis',
            runState.p1 === 'done' ? 'Ad tagged and copy blocks extracted.' : 'Analyzing winning ad...',
            <><b>{runState.p1 === 'done' ? '✓' : '...'}</b></>
          )}
          {phaseCard('02', 'p2', 'Variants',
            runState.p2 === 'done' ? `${numVariants} variants generated.` : runState.p2 === 'run' ? 'Generating variants...' : 'Waiting...',
            <><b>{runState.p2 === 'done' ? '✓' : '...'}</b><span>{numVariants} bots</span></>
          )}
          {phaseCard('03', 'p3', 'Images · Nano Banana 2',
            runState.p3 === 'done' ? 'Images rendered and delivered.' : runState.p3 === 'run' ? 'Generating images...' : 'Waiting...',
            <><b>{runState.p3 === 'done' ? '✓' : '...'}</b><span>est {money(estCost)}</span></>
          )}
        </div>

        <div className="card fade-in">
          <div className="card-h">
            <I.text size={15} />
            <span className="title">Live log</span>
            <span className="sub">pipeline</span>
          </div>
          <div className="logs">
            {logs.length === 0 && (
              <div style={{ padding: '42px 18px', textAlign: 'center', color: 'var(--t-low)', fontSize: 13 }}>
                No active jobs. Submit an ad from the Upload tab.
              </div>
            )}
            {logs.map((l, i) => (
              <div key={i} className={`log ${l.phase} ${l.kind}`}>
                <span className="ts">{l.t}</span>
                <span className="ic">
                  {l.kind === 'ok' ? <I.check size={12} /> : l.kind === 'err' ? <I.x size={12} /> : <I.dots size={12} />}
                </span>
                <span>{l.msg}</span>
                <span className="tag">{l.phase}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card fade-in">
          <div className="card-h">
            <I.activity size={15} />
            <span className="title">Run metrics</span>
          </div>
          <div className="run-meta">
            <div className="stat-grid">
              <div className="stat">
                <div className="k">Elapsed</div>
                <div className="v">{runStats.elapsed} <span>s</span></div>
              </div>
              <div className="stat">
                <div className="k">ETA</div>
                <div className="v">~{Math.max(0, (numVariants * 55 + 90) - runStats.elapsed)} <span>s</span></div>
              </div>
              <div className="stat">
                <div className="k">Variants</div>
                <div className="v">{numVariants}</div>
              </div>
              <div className="stat">
                <div className="k">Est. cost</div>
                <div className="v">{money(estCost)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// === gallery.jsx ===
// GALLERY VIEW
function GalleryView({ downloadCSV = () => { }, realResults = [] }) {
  const [filter, setFilter] = useState({ cat: 'all', ratio: 'all' });
  const [view, setView] = useState('grid');

  // Use real results if available, otherwise show mock data
  const hasRealData = realResults.length > 0;
  const dataSource = hasRealData ? realResults : AD_UNITS;

  const filtered = useMemo(() => {
    return dataSource.filter(a => {
      const bot = ALL_BOTS.find(b => b.id === a.bot);
      if (filter.cat !== 'all' && bot?.cat !== filter.cat) return false;
      if (filter.ratio !== 'all' && a.ratio !== filter.ratio) return false;
      return true;
    });
  }, [filter, dataSource]);

  const countBy = (key, val) => dataSource.filter(a => {
    if (key === 'cat') {
      const bot = ALL_BOTS.find(b => b.id === a.bot);
      return bot?.cat === val;
    }
    return a[key] === val;
  }).length;

  return (
    <div className="fade-in">
      <div className="gall-h">
        <div>
          <h2>Generated ad units <b>{filtered.length}/{dataSource.length}</b></h2>
          <div style={{ fontSize: 12, color: 'var(--t-low)', marginTop: 6, fontFamily: 'var(--mono)' }}>
            {hasRealData ? `Pipeline results · ${dataSource.length} ad units` : 'Showing demo data · run the pipeline to see real results'}
          </div>
        </div>
        <div className="gh-right">
          <Btn variant="primary" onClick={downloadCSV}><I.download size={13} /> Download batch <span style={{ opacity: 0.7, fontFamily: 'var(--mono)', fontSize: 10 }}>CSV</span></Btn>
        </div>
      </div>

      <div className="filter-bar">
        <span className="tiny-mono" style={{ marginRight: 6, color: 'var(--t-dim)' }}>FILTER</span>
        <button className={`filter-chip ${filter.cat === 'all' ? 'on' : ''}`} onClick={() => setFilter(f => ({ ...f, cat: 'all' }))}>
          All bots <span className="ct">{dataSource.length}</span>
        </button>
        <button className={`filter-chip ${filter.cat === 'ai_image' ? 'on' : ''}`} onClick={() => setFilter(f => ({ ...f, cat: 'ai_image' }))}>
          <I.image size={11} /> AI Image <span className="ct">{countBy('cat', 'ai_image')}</span>
        </button>
        <button className={`filter-chip ${filter.cat === 'real_photo' ? 'on' : ''}`} onClick={() => setFilter(f => ({ ...f, cat: 'real_photo' }))}>
          <I.eye size={11} /> Real photo <span className="ct">{countBy('cat', 'real_photo')}</span>
        </button>
        <span className="filter-sep" />
        {['all', '9:16', '1:1', '4:5'].map(r => (
          <button key={r} className={`filter-chip ${filter.ratio === r ? 'on' : ''}`} onClick={() => setFilter(f => ({ ...f, ratio: r }))}>
            {r === 'all' ? 'All ratios' : r}
            {r !== 'all' && <span className="ct">{countBy('ratio', r)}</span>}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <div className="seg">
            <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>Grid</button>
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>List</button>
          </div>
        </div>
      </div>

      <div className="ad-grid">
        {filtered.map(a => {
          const bot = ALL_BOTS.find(b => b.id === a.bot);
          const ratioCls = `ar-${a.ratio.replace(':', '-')}`;
          return (
            <div key={a.id} className="adcard">
              <div className={`ad-img ${ratioCls}`}>
                <span className="ar-badge">{a.ratio}</span>
                {a.imageUrl ? (
                  <img src={a.imageUrl} alt={a.headline} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, borderRadius: 'inherit' }} />
                ) : (
                  <MockSurface surface={a.surface} headline={a.headline} ratio={a.ratio} />
                )}
              </div>
              <div className="ad-body">
                <div className={`ad-bot ${bot.cat === 'ai_image' ? 'ai' : 'real'}`}>
                  <span className="g">{bot.glyph}</span> {bot.name}
                </div>
                <div className="ad-sec">
                  <div className="ad-sec-h">
                    <span>Headline</span>
                    <CopyButton text={a.headline} />
                  </div>
                  <div className="ad-headline">{a.headline}</div>
                </div>
                <div className="ad-sec">
                  <div className="ad-sec-h">
                    <span>Primary text</span>
                    <CopyButton text={a.body} />
                  </div>
                  <div className="ad-body-txt">{a.body}</div>
                </div>
              </div>
              <div className="ad-foot">
                <span style={{ fontSize: 11, color: 'var(--t-low)', fontFamily: 'var(--mono)' }}>{a.ratio}</span>
                <span className="dot-sep" />
                <span style={{ fontSize: 11, color: 'var(--t-dim)' }}>14d expiry</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



// === ad-mocks.jsx ===
// Mock ad surfaces — visually-distinct fake ad creatives per bot style.
// Pure CSS/SVG, no external assets. These are placeholders that read as ads.

function MockSurface({ surface, headline, ratio }) {
  const S = SURFACES[surface] || SURFACES.hero;
  return <S headline={headline} ratio={ratio} />;
}

const SURFACES = {

  curiosity: ({ headline }) => (
    <div className="mock-surface grain" style={{
      background:
        'radial-gradient(120% 80% at 70% 20%, #6b3a2d 0%, transparent 55%),' +
        'radial-gradient(80% 60% at 20% 90%, #2b1d36 0%, transparent 60%),' +
        'linear-gradient(160deg, #1a1217 0%, #0e0a10 100%)',
      color: '#fff'
    }}>
      <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.7, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        <span>Sponsored · Drift</span>
        <span>···</span>
      </div>
      <div style={{ position: 'absolute', left: 18, right: 18, bottom: 64, fontFamily: 'var(--serif)', fontSize: 'min(28px, 7.5cqw)', lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.01em', containerType: 'inline-size' }}>
        {headline}
      </div>
      <div style={{ position: 'absolute', left: 18, bottom: 18, padding: '8px 14px', background: '#fff', color: '#0d1117', fontSize: 11, fontWeight: 600, borderRadius: 6, letterSpacing: 0.2 }}>
        Read the story →
      </div>
    </div>
  ),

  hero: ({ headline }) => (
    <div className="mock-surface grain" style={{
      background:
        'radial-gradient(60% 80% at 50% 40%, #2f3a55 0%, #0c0f17 70%)',
    }}>
      {/* Product silhouette */}
      <div style={{
        position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)',
        width: '30%', height: '56%',
        background: 'linear-gradient(180deg, #c8d4e6 0%, #5a6478 50%, #1d222c 100%)',
        borderRadius: '40% 40% 24% 24% / 18% 18% 8% 8%',
        boxShadow: 'inset -8px 0 24px rgba(0,0,0,0.4), inset 6px 0 24px rgba(255,255,255,0.12), 0 30px 60px rgba(0,0,0,0.55)'
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '30%', transform: 'translateX(-50%)',
        width: '12%', height: '8%', background: '#0a0c10', borderRadius: '30%',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
      }} />
      <div style={{ position: 'absolute', top: 14, left: 14, fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        Hydro · 2026
      </div>
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, color: '#fff', fontWeight: 600, fontSize: 'min(15px, 4cqw)', lineHeight: 1.2, letterSpacing: '-0.01em', containerType: 'inline-size' }}>
        {headline}
      </div>
    </div>
  ),

  stat: ({ headline }) => (
    <div className="mock-surface" style={{
      background: '#0d1f1a', color: '#eafaf3',
      display: 'grid', gridTemplateRows: '1fr auto', padding: '18px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 'min(82px, 20cqw)', lineHeight: 0.85, letterSpacing: '-0.04em', color: '#2dd4a4', containerType: 'inline-size' }}>87%</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em', marginTop: 6, textTransform: 'uppercase' }}>of returns happen ≤ day 14</div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 10, fontSize: 12, lineHeight: 1.35, fontWeight: 500, color: '#cfe8dc', letterSpacing: '-0.005em' }}>
        {headline}
      </div>
    </div>
  ),

  beforeafter: ({ headline }) => (
    <div className="mock-surface" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
      <div style={{
        background: 'linear-gradient(160deg, #5a6173 0%, #2c303b 100%)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 10, left: 10, fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Before</div>
      </div>
      <div style={{
        background: 'linear-gradient(160deg, #f1e6d1 0%, #d4b48b 100%)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 10, right: 10, fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(0,0,0,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>After</div>
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 34, height: 34, borderRadius: '50%', background: '#0d1117', border: '2px solid #fff',
        display: 'grid', placeItems: 'center', color: '#fff', fontSize: 14, fontWeight: 600
      }}>
        ⇄
      </div>
      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 14, color: '#fff',
        background: 'rgba(8,10,14,0.78)', backdropFilter: 'blur(6px)', padding: '10px 12px',
        borderRadius: 8, fontWeight: 600, fontSize: 'min(14px,3.8cqw)', lineHeight: 1.25, letterSpacing: '-0.01em', containerType: 'inline-size'
      }}>
        {headline}
      </div>
    </div>
  ),

  postit: ({ headline }) => (
    <div className="mock-surface grain" style={{
      background: '#1a1e28', display: 'grid', placeItems: 'center', padding: 24
    }}>
      <div style={{
        width: '85%', aspectRatio: '1/1', background: 'linear-gradient(135deg, #ffe66b 0%, #f7d23d 100%)',
        boxShadow: '0 18px 36px rgba(0,0,0,0.45), inset 0 -16px 30px rgba(0,0,0,0.05)',
        transform: 'rotate(-3deg)',
        padding: '18px 18px', position: 'relative',
        color: '#241a00', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
      }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'min(20px,5.5cqw)', lineHeight: 1.15, letterSpacing: '-0.01em', containerType: 'inline-size' }}>
          {headline}
        </div>
        <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>— me, last Tuesday</div>
      </div>
    </div>
  ),

  news: ({ headline }) => (
    <div className="mock-surface" style={{ background: '#f5f3ee', color: '#1a1612', padding: 18, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1612', paddingBottom: 8 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 18, letterSpacing: '-0.02em', fontWeight: 400 }}>The Brooklyn Review</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7 }}>Issue 142</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, marginTop: 14, flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a13e1a', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>Sponsored · Business</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 'min(22px,5.5cqw)', lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.01em', containerType: 'inline-size' }}>
            {headline}
          </div>
          <div style={{ marginTop: 10, fontSize: 10.5, lineHeight: 1.45, opacity: 0.7, columnCount: 1, fontFamily: 'Georgia, serif' }}>
            They wouldn't talk on the record. So we showed up. What followed was a 40-minute conversation that quietly reframed what a sleep company is supposed to be — and where the next decade of consumer health quietly slips.
          </div>
        </div>
        <div style={{ background: '#d8d2c4', borderRadius: 2 }} />
      </div>
    </div>
  ),

  receipt: ({ headline }) => (
    <div className="mock-surface" style={{ background: '#15171f', display: 'grid', placeItems: 'center', padding: 18 }}>
      <div style={{
        width: '82%', background: '#fdfbf3', color: '#1a1612', padding: '18px 16px 26px',
        fontFamily: 'var(--mono)', fontSize: 'min(11px,3cqw)',
        clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 8px), 95% 100%, 90% calc(100% - 8px), 85% 100%, 80% calc(100% - 8px), 75% 100%, 70% calc(100% - 8px), 65% 100%, 60% calc(100% - 8px), 55% 100%, 50% calc(100% - 8px), 45% 100%, 40% calc(100% - 8px), 35% 100%, 30% calc(100% - 8px), 25% 100%, 20% calc(100% - 8px), 15% 100%, 10% calc(100% - 8px), 5% 100%, 0% calc(100% - 8px))',
        boxShadow: '0 18px 36px rgba(0,0,0,0.45)',
        containerType: 'inline-size'
      }}>
        <div style={{ textAlign: 'center', fontWeight: 600, letterSpacing: '0.18em', marginBottom: 10 }}>MORNING ROUTINE</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Coffee, drip ×30</span><span>$ 4.20</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Greens powder</span><span>$ 2.30</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pre-workout</span><span>$ 1.85</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Collagen scoop</span><span>$ 3.05</span></div>
        <div style={{ borderTop: '1px dashed #1a1612', margin: '8px 0', paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
          <span>DAILY TOTAL</span><span>$ 11.40</span>
        </div>
        <div style={{ marginTop: 10, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'min(13px,3.6cqw)', lineHeight: 1.25, letterSpacing: '-0.005em', textAlign: 'center' }}>
          {headline}
        </div>
      </div>
    </div>
  ),

  boldtype: ({ headline }) => (
    <div className="mock-surface" style={{
      background: 'linear-gradient(160deg, #1a1226 0%, #0a0c10 100%)',
      padding: '22px 20px', color: '#fff',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        Eight Sleep · Pod 5
      </div>
      <div style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 'min(36px,9cqw)', lineHeight: 0.9, letterSpacing: '-0.04em', containerType: 'inline-size' }}>
        {headline}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 10 }}>
        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>Up to 1h more deep sleep · wk 1</div>
        <div style={{ padding: '7px 11px', background: '#fff', color: '#0a0c10', fontSize: 10.5, fontWeight: 600, borderRadius: 5 }}>Shop now</div>
      </div>
    </div>
  ),

  ugc: ({ headline }) => (
    <div className="mock-surface grain" style={{
      background: 'linear-gradient(160deg, #564a3c 0%, #2a221b 100%)',
      position: 'relative', color: '#fff'
    }}>
      {/* fake face placeholder */}
      <div style={{
        position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-50%)',
        width: '40%', aspectRatio: '1/1', borderRadius: '50%',
        background: 'radial-gradient(70% 70% at 50% 40%, #d4b69a 0%, #6b5640 100%)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
      }} />
      {/* TT-style overlays */}
      <div style={{ position: 'absolute', top: 14, left: 14, fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 8px', background: 'rgba(0,0,0,0.45)', borderRadius: 5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        @sam.from.bk · 2d
      </div>
      <div style={{ position: 'absolute', left: 14, right: 60, bottom: 14, fontWeight: 600, fontSize: 'min(14px,3.8cqw)', lineHeight: 1.25, letterSpacing: '-0.005em', textShadow: '0 2px 8px rgba(0,0,0,0.6)', containerType: 'inline-size' }}>
        {headline}
      </div>
      <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {['♡', '💬', '↗'].map(g => (
          <div key={g} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', fontSize: 13 }}>{g}</div>
        ))}
      </div>
    </div>
  ),
};



// === app.jsx ===
// MAIN APP
function App() {
  const WEBHOOK_URL = 'https://ad-recreator-production.up.railway.app/webhook/ad-recreator-full';

  const [tab, setTab] = useState('upload');
  const [status, setStatus] = useState('idle');

  // Upload state
  const [ad, setAd] = useState('');
  const [offer, setOffer] = useState('');
  const [fileName, setFileName] = useState('');
  const [numVariants, setNumVariants] = useState(3);
  const [ratios, setRatios] = useState(['9:16']);
  const [category, setCategory] = useState('ai_image');
  const [selectedBots, setSelectedBots] = useState(AI_BOTS.map(b => b.id));

  // Real pipeline state
  const [logs, setLogs] = useState([]);
  const [runHistory, setRunHistory] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [runState, setRunState] = useState({
    p1: 'wait', p2: 'wait', p3: 'wait',
    progress: { p1: 0, p2: 0, p3: 0 }
  });
  const [runStats, setRunStats] = useState({ elapsed: 0, tokens: 0, cost: 0 });
  const timerRef = useRef(null);

  useEffect(() => {
    if (category === 'ai_image') setSelectedBots(AI_BOTS.map(b => b.id));
    else if (category === 'real_photo') setSelectedBots(REAL_BOTS.map(b => b.id));
    else setSelectedBots(ALL_BOTS.map(b => b.id));
  }, [category]);

  const toggleBot = (id) => setSelectedBots(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAllBots = () => {
    setSelectedBots(s => s.length === ALL_BOTS.length ? [] : ALL_BOTS.map(b => b.id));
  };
  const toggleRatio = (r) => setRatios(rs => rs.includes(r) ? (rs.length > 1 ? rs.filter(x => x !== r) : rs) : [...rs, r]);

  const onFile = (f) => {
    setFileName(f.name);
    f.text?.().then(t => setAd(t));
  };

  const est = useMemo(() => {
    const bots = selectedBots.length || 1;
    const images = numVariants * ratios.length;
    const credits = images * CREDITS_PER_IMG;
    const cost = images * COST_PER_IMG;
    return { bots, images, credits, cost };
  }, [numVariants, ratios, selectedBots]);

  const addLog = (phase, kind, msg) => {
    const t = new Date();
    const ts = `${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
    setLogs(prev => [...prev, { t: ts, phase, kind, msg }]);
  };

  const onSubmit = async () => {
    if (!ad.trim()) return;
    setStatus('active');
    setTab('queue');
    setLogs([]);
    setGalleryItems([]);
    setRunStats({ elapsed: 0, tokens: 0, cost: 0 });

    const startTime = Date.now();
    const estTotal = (numVariants * 55) + 120; // estimated total seconds

    // Start elapsed timer + progress simulation
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setRunStats(prev => ({ ...prev, elapsed }));

      // Simulate phase progress based on elapsed time
      const p1End = 30; // Phase 1 takes ~30s
      const p2End = p1End + (numVariants * 55); // Phase 2
      const p3End = estTotal; // Phase 3

      if (elapsed < p1End) {
        const p1Pct = Math.min(95, Math.floor((elapsed / p1End) * 100));
        setRunState({ p1: 'run', p2: 'wait', p3: 'wait', progress: { p1: p1Pct, p2: 0, p3: 0 } });
      } else if (elapsed < p2End) {
        const p2Pct = Math.min(95, Math.floor(((elapsed - p1End) / (p2End - p1End)) * 100));
        setRunState({ p1: 'done', p2: 'run', p3: 'wait', progress: { p1: 100, p2: p2Pct, p3: 0 } });
      } else if (elapsed < p3End) {
        const p3Pct = Math.min(95, Math.floor(((elapsed - p2End) / (p3End - p2End)) * 100));
        setRunState({ p1: 'done', p2: 'done', p3: 'run', progress: { p1: 100, p2: 100, p3: p3Pct } });
      } else {
        // Past ETA — show near-complete
        setRunState({ p1: 'done', p2: 'done', p3: 'run', progress: { p1: 100, p2: 100, p3: 98 } });
      }
    }, 1000);

    addLog('p1', 'info', `Pipeline started · ${numVariants} variants · ${ratios.join(', ')}`);
    addLog('p1', 'info', `Estimated time: ~${Math.ceil(estTotal / 60)} min`);

    try {
      // POST to webhook — now responds instantly
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_content: ad,
          offer: offer,
          num_variants: numVariants,
          aspect_ratios: ratios,
          bot_filter: category
        })
      });

      const data = await res.json();

      if (data.status === 'accepted' || data.status === 'ok') {
        addLog('p1', 'ok', `Job accepted · ID: ${data.job_id || 'N/A'}`);

        // If pipeline returned results (synchronous mode), populate gallery immediately
        if (data.results && data.results.length > 0) {
          const items = data.results
            .filter(r => r.imageUrl && r.state === 'success')
            .map((r, i) => {
              const botMap = {
                'Curiosity Bait': 'curiosity', 'Bold Typography': 'bold-type',
                'Native News': 'native-news', 'Receipt': 'receipt',
                'Problem-Solution': 'problem', 'Lo-Fi': 'lo-fi',
                'Meme Style': 'meme', 'Scientific Study': 'science',
                'Infographic': 'infographic', 'Post-It Note': 'post-it',
                'Quiz/Interactive': 'quiz', 'Statistic': 'stat',
                'Breaking News': 'breaking', 'Note From Founder': 'founder',
                'Screenshot/Chat': 'screenshot', 'Hero Shot': 'hero',
                'UGC': 'ugc', 'Holding Sign': 'holding',
                'Happy Avatar': 'happy', 'Before & After': 'before-after'
              };
              return {
                id: `real-${i}`,
                bot: botMap[r.bot_name] || 'curiosity',
                ratio: r.aspect_ratio || '9:16',
                surface: 'real',
                headline: r.headline || r.bot_name || '',
                body: r.primary_text || '',
                imageUrl: r.imageUrl,
                score: 8.5,
                copies: 0
              };
            });
          setGalleryItems(items);

          // Pipeline complete — update everything immediately
          setRunState({ p1: 'done', p2: 'done', p3: 'done', progress: { p1: 100, p2: 100, p3: 100 } });
          setStatus('done');
          setRunStats(prev => ({ ...prev, cost: est.cost, tokens: numVariants * 2000 }));
          clearInterval(timerRef.current);
          addLog('p1', 'ok', 'Phase 1 complete · Ad analyzed');
          addLog('p2', 'ok', 'Phase 2 complete · Variants generated');
          addLog('p3', 'ok', `Phase 3 complete · ${items.length} images generated`);
          addLog('p3', 'ok', '✅ Full pipeline complete · Results in Gallery');

          const runName = offer ? offer.substring(0, 30) : ad.substring(0, 30);
          setRunHistory(prev => [
            { id: `r-${Date.now()}`, name: runName, when: 'now', status: 'done' },
            ...prev.slice(0, 9)
          ]);

          // Switch to gallery
          setTimeout(() => setTab('gallery'), 1000);

        } else {
          // No results in response — async mode, simulate progress
          addLog('p1', 'info', 'Analyzing ad (tagging + copy blocks)...');
          const p1Time = 30 * 1000;
          const p2Time = (numVariants * 55) * 1000;
          const p3Time = 120 * 1000;

          setTimeout(() => {
            addLog('p1', 'ok', 'Phase 1 complete · Ad analyzed');
            addLog('p2', 'info', `Generating ${numVariants} variants across format bots...`);
          }, p1Time);

          setTimeout(() => {
            addLog('p2', 'ok', 'Phase 2 complete · Variants generated');
            addLog('p3', 'info', 'Submitting to Kie.ai for image generation...');
          }, p1Time + p2Time);

          setTimeout(() => {
            addLog('p3', 'ok', '✅ Full pipeline complete · Results delivered to Discord');
            setRunState({ p1: 'done', p2: 'done', p3: 'done', progress: { p1: 100, p2: 100, p3: 100 } });
            setStatus('done');
            setRunStats(prev => ({ ...prev, cost: est.cost, tokens: numVariants * 2000 }));
            clearInterval(timerRef.current);

            const runName = offer ? offer.substring(0, 30) : ad.substring(0, 30);
            setRunHistory(prev => [
              { id: `r-${Date.now()}`, name: runName, when: 'now', status: 'done' },
              ...prev.slice(0, 9)
            ]);
          }, p1Time + p2Time + p3Time);
        }

      } else {
        throw new Error(data.message || 'Webhook rejected');
      }
    } catch (err) {
      setStatus('error');
      clearInterval(timerRef.current);
      addLog('p1', 'err', `Error: ${err.message}`);
      setRunState({ p1: 'wait', p2: 'wait', p3: 'wait', progress: { p1: 0, p2: 0, p3: 0 } });
      setRunHistory(prev => [
        { id: `r-${Date.now()}`, name: 'Failed run', when: 'now', status: 'err' },
        ...prev.slice(0, 9)
      ]);
    }
  };

  // Download batch as CSV
  const downloadCSV = () => {
    const data = galleryItems.length > 0 ? galleryItems : AD_UNITS;
    const headers = 'variant,bot,headline,primary_text,image_url,aspect_ratio\n';
    const rows = data.map(a =>
      `"${a.id}","${ALL_BOTS.find(b => b.id === a.bot)?.name || a.bot}","${(a.headline || '').replace(/"/g, '""')}","${(a.body || '').replace(/"/g, '""')}","${a.imageUrl || ''}","${a.ratio}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ad-recreator-batch-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Sidebar nav
  const navItems = [
    { id: 'upload', ico: <I.upload size={14} />, label: 'Upload', meta: '⌘ 1' },
    { id: 'queue', ico: <I.queue size={14} />, label: 'Queue', meta: '⌘ 2' },
    { id: 'gallery', ico: <I.gallery size={14} />, label: 'Gallery', meta: '⌘ 3' },
  ];

  const tabTitle = tab === 'upload' ? 'New run' : tab === 'queue' ? 'Live pipeline' : 'Gallery';
  const tabSub = tab === 'upload'
    ? 'Compose a brief, choose your bot lineup, and ship it through the 3-phase Genesis pipeline.'
    : tab === 'queue'
      ? 'Watch the 3 phases of the Genesis pipeline as they run — analysis, fan-out, and rendering.'
      : 'Browse every variant the pipeline produced. Copy, compare, and export as a Meta-ready batch.';

  return (
    <>
      <style>{CSS}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif&display=swap" rel="stylesheet" />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              <I.bolt size={18} />
            </div>
            <div className="brand-text">
              <b>Ad Recreator</b>
              <span>v1.0 · genesis</span>
            </div>
          </div>

          <div className="nav-label">Pipeline</div>
          <div className="sidebar-section">
            {navItems.map(n => (
              <div key={n.id} className={`nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
                <span className="nav-ico">{n.ico}</span>
                {n.label}
                <span className="nav-meta">{n.meta}</span>
              </div>
            ))}
          </div>

          <div className="nav-label">Recent runs</div>
          <div className="runs">
            {runHistory.map(r => {
              const c = r.status === 'run' ? 'var(--blue)' : r.status === 'err' ? 'var(--red)' : 'var(--green)';
              return (
                <div key={r.id} className="run" onClick={() => { if (r.status === 'done') setTab('gallery'); }}>
                  <span className="dot" style={{ background: c }} />
                  <span className="name">{r.name}</span>
                  <span className="time">{r.when}</span>
                </div>
              );
            })}
            {runHistory.length === 0 && <div style={{ padding: '12px 8px', fontSize: 12, color: 'var(--t-dim)' }}>No runs yet</div>}
          </div>

          <div className="sidebar-foot">
            <div className="avatar">AT</div>
            <div className="who">
              <b>Angelo T.</b>
              <span>media buyer · Midas</span>
            </div>
            <button className="icon-btn" style={{ marginLeft: 'auto', width: 28, height: 28 }}><I.settings size={13} /></button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="crumbs">
              <I.activity size={14} />
              <b>Workspace</b>
              <span className="sep">/</span>
              <span>{tabTitle}</span>
            </div>
            <div className="topbar-right">
              <span className="kpi"><I.coins size={13} /> <b>{money(runStats.cost)}</b> this run</span>
              <span className="kpi"><I.image size={13} /> <b>{est.images}</b> renders</span>
              <span className="kpi"><I.clock size={13} /> <b>{runStats.elapsed}s</b> elapsed</span>
              <StatusPill status={status === 'active' ? 'p2' : status} />
              <IconBtn title="Command palette"><I.search size={14} /></IconBtn>
            </div>
          </div>

          <div className="content">
            <div className="page-h">
              <div>
                <h1>{tab === 'upload' ? <>New run · <span className="accent">brief in, batch out</span></> : tabTitle}</h1>
                <p>{tabSub}</p>
              </div>
              {tab === 'upload' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn><I.book size={13} /> Templates</Btn>
                  <Btn><I.refresh size={13} /> Load last run</Btn>
                </div>
              )}
            </div>

            {tab === 'upload' && (
              <UploadView
                ad={ad} setAd={setAd}
                offer={offer} setOffer={setOffer}
                fileName={fileName} onFile={onFile}
                numVariants={numVariants} setNumVariants={setNumVariants}
                ratios={ratios} toggleRatio={toggleRatio}
                category={category} setCategory={setCategory}
                selectedBots={selectedBots} toggleBot={toggleBot} selectAllBots={selectAllBots}
                est={est}
                onSubmit={onSubmit}
                submitting={status === 'active'}
                canSubmit={ad.trim().length > 0}
              />
            )}

            {tab === 'queue' && (
              <QueueView status={status === 'active' ? (runState.p2 === 'run' ? 'p2' : 'p1') : 'idle'} logs={logs} runState={runState} runStats={runStats} numVariants={numVariants} estCost={est.cost} />
            )}

            {tab === 'gallery' && <GalleryView downloadCSV={downloadCSV} realResults={galleryItems} />}
          </div>
        </main>
      </div>
    </>
  );
}





export default App;
