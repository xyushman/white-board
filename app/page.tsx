import Link from "next/link";
import { Show } from "@clerk/nextjs";
import "./landing.css";
import { LandingMotion } from "@/components/landing/landing-motion";

const NAME_A = "ai";
const NAME_B = "whiteboard";

const TILES = [
  {
    src: "https://images.unsplash.com/photo-1649209979970-f01d950cc5ed?ixlib=rb-4.1.0&auto=format&fit=crop&w=360&q=60",
    alt: "Hands sketching a diagram on a whiteboard",
    bg: "#260c0c",
  },
  {
    src: "https://images.unsplash.com/photo-1772588627342-5ec373e236d8?ixlib=rb-4.1.0&auto=format&fit=crop&w=420&q=60",
    alt: "Sticky notes arranged across a wall during a brainstorm",
    bg: "#a6a6a6",
  },
  {
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.1.0&auto=format&fit=crop&w=420&q=60",
    alt: "A team mapping a flow on a glass wall",
    bg: "#c0c0c0",
  },
  {
    src: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.1.0&auto=format&fit=crop&w=420&q=60",
    alt: "Wireframes and notes laid out on a desk",
    bg: "#d9d9d9",
  },
];

const TOOLS = [
  {
    name: "Diagrams",
    send: "A sentence describing what you want to see.",
    back: "A structured diagram drawn on the canvas in seconds.",
    often: "On demand",
  },
  {
    name: "Flowcharts",
    send: "Steps, decisions and where the branches lead.",
    back: "Connected nodes with labelled arrows, ready to edit.",
    often: "On demand",
  },
  {
    name: "Architecture",
    send: "The services and how they talk to each other.",
    back: "A service map laid out cleanly, box by box.",
    often: "On demand",
  },
  {
    name: "Mockups",
    send: "A screen or two you have in mind.",
    back: "Web and mobile wireframes as editable shapes.",
    often: "On demand",
  },
];

const WORKFLOW = [
  {
    day: "Step 1",
    title: "Prompt",
    text: "Pick a tool, describe the idea in plain words and press generate.",
  },
  {
    day: "Step 2",
    title: "Draft",
    text: "The assistant returns a scene and drops it onto your canvas instantly.",
  },
  {
    day: "Step 3",
    title: "Refine",
    text: "Every element is yours — move, recolour and relabel by hand.",
  },
  {
    day: "Step 4",
    title: "Ship",
    text: "Autosave keeps it safe; export a crisp PNG whenever you are ready.",
  },
];

const CLIENT_CARDS = [
  { name: "Startup map", trade: "Product", kind: "text" },
  { name: "", trade: "", kind: "photo" },
  { name: "API plan", trade: "Backend", kind: "text" },
  { name: "Sprint board", trade: "Planning", kind: "text" },
  { name: "", trade: "", kind: "photo" },
  { name: "Onboarding", trade: "Flow", kind: "text" },
  { name: "Data model", trade: "Schema", kind: "text" },
  { name: "", trade: "", kind: "photo" },
  { name: "Landing copy", trade: "Wireframe", kind: "text" },
  { name: "Cloud setup", trade: "Infra", kind: "text" },
  { name: "", trade: "", kind: "photo" },
  { name: "Pricing page", trade: "Mockup", kind: "text" },
  { name: "Team chart", trade: "Org", kind: "text" },
  { name: "", trade: "", kind: "photo" },
  { name: "Roadmap", trade: "Timeline", kind: "text" },
  { name: "Support flow", trade: "Flowchart", kind: "text" },
];

const CLIENT_PHOTOS = [
  "https://images.unsplash.com/photo-1591538519435-4578c3ba26d6?ixlib=rb-4.1.0&auto=format&fit=crop&w=140&q=60",
  "https://images.unsplash.com/photo-1593702295094-aea22597af65?ixlib=rb-4.1.0&auto=format&fit=crop&w=120&q=60",
  "https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?ixlib=rb-4.1.0&auto=format&fit=crop&w=130&q=60",
  "https://images.unsplash.com/photo-1627881032258-599944eab8a1?ixlib=rb-4.1.0&auto=format&fit=crop&w=110&q=60",
  "https://images.unsplash.com/photo-1630147351247-8d7b39d7e681?ixlib=rb-4.1.0&auto=format&fit=crop&w=150&q=60",
  "https://images.unsplash.com/photo-1676018366904-c083ed678e60?ixlib=rb-4.1.0&auto=format&fit=crop&w=130&q=60",
];

const PLANS = [
  {
    name: "Free",
    for: "Trying the assistant out",
    items: [
      "3 AI generations a month",
      "Unlimited boards",
      "Full Excalidraw canvas",
      "PNG export",
    ],
    fee: "£0",
    unit: "forever",
    badge: "",
  },
  {
    name: "Pro",
    for: "Builders who diagram every day",
    items: [
      "200 AI generations a month",
      "All six AI tools",
      "High-resolution export",
      "Archive & trash history",
    ],
    fee: "£9",
    unit: "a month",
    badge: "Most popular",
  },
  {
    name: "Team",
    for: "Shared boards for a whole squad",
    items: [
      "1,000 AI generations a month",
      "Everything in Pro",
      "5 seats included",
      "Usage analytics",
    ],
    fee: "£24",
    unit: "a month",
    badge: "",
  },
];

const STEPS = [
  {
    title: "Create an account",
    text: "Sign in with a single click. No card, no setup.",
  },
  {
    title: "Describe a board",
    text: "Pick a tool and prompt the assistant for your first scene.",
  },
  {
    title: "Refine and share",
    text: "Edit by hand, autosave runs itself, export when ready.",
  },
];

const FAQS = [
  {
    q: "What exactly is an AI credit?",
    a: "One credit is one AI-generated scene. Each prompt produces a full diagram, flowchart, architecture map, mockup or mindmap drawn straight onto your canvas.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. It runs entirely in your browser on an infinite canvas. Sign in and start drawing in seconds.",
  },
  {
    q: "Can I edit what the AI generates?",
    a: "Always. The output is ordinary canvas elements — every shape, label and arrow is fully editable by hand.",
  },
  {
    q: "Where are my boards stored?",
    a: "Boards autosave to the cloud as you work. Archive or trash them anytime and restore anything you delete.",
  },
  {
    q: "Can I export my work?",
    a: "Yes. Export any board as a crisp, high-resolution PNG in one click, ready for docs, decks or tickets.",
  },
  {
    q: "Can I cancel?",
    a: "In any month. There is no notice period, and your boards stay yours to export.",
  },
];

const REVIEWS = [
  {
    quote:
      "“I typed one sentence about our architecture and had a clean service map in about five seconds. Then I moved every box.”",
    who: "Priya Nair",
    where: "Freelance architect",
  },
  {
    quote:
      "“The mindmap tool replaced the first hour of every planning session. We start from the draft now.”",
    who: "Dan Cole",
    where: "Product lead",
  },
  {
    quote:
      "“Mockups on the same canvas as the flow that explains them. That alone sold the team.”",
    who: "Lewis Marsh",
    where: "Founder",
  },
  {
    quote:
      "“It just saves. I closed the tab, came back the next day, and everything was exactly where I left it.”",
    who: "Hana Wells",
    where: "Designer",
  },
];

export default function LandingPage() {
  const photoIndexes: number[] = [];
  const frames = CLIENT_CARDS.map((card, i) => {
    const lat = (74.6 - (i * 148.8) / (CLIENT_CARDS.length - 1)).toFixed(1);
    const lon = (((i * 317.7) % 360) + 0.0).toFixed(1);
    if (card.kind === "photo") {
      const src = CLIENT_PHOTOS[photoIndexes.length % CLIENT_PHOTOS.length];
      photoIndexes.push(i);
      return { ...card, src, lat, lon, i };
    }
    return { ...card, src: "", lat, lon, i };
  });

  return (
    <div className="ev">
      <LandingMotion />

      <header id="nav" className="nav">
        <Link className="nav__logo" href="/" aria-label="AI Whiteboard, back to the top">
          <span className="nav__mark" aria-hidden="true" />
        </Link>
        <div className="nav__auth">
          <Show when="signed-out">
            <Link className="m-btn-3" href="/sign-in">
              <span className="m-btn-3__label">Sign in</span>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link className="m-btn-3" href="/dashboard">
              <span className="m-btn-3__label">Dashboard</span>
            </Link>
          </Show>
        </div>
        <button className="m-btn-3 nav__menu" type="button" aria-expanded="false" aria-controls="menu">
          <span className="m-btn-3__label">Menu</span>
        </button>
        <div className="menu" id="menu" hidden>
          <span className="menu__rule" aria-hidden="true" />
          <div className="menu__top">
            <button className="m-icon menu__close" type="button" aria-label="Close menu">
              <svg className="m-icon__glyph" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>
          <nav aria-label="Main">
            <ul className="menu__list">
              <li><a className="m-link-3" href="#services">Tools</a></li>
              <li><a className="m-link-3" href="#workflow">How it works</a></li>
              <li><a className="m-link-3" href="#boards">Boards</a></li>
              <li><a className="m-link-3" href="#prices">Pricing</a></li><li><a className="m-link-3" href="#faq">Questions</a></li>
              <li><a className="m-link-3" href="#contact">Contact</a></li>
            </ul>
          </nav>
          <div className="menu__foot">
            <p className="m-text-3">An Excalidraw + Gemini workspace</p>
            <p className="m-text-3">Built for people who think visually</p>
          </div>
        </div>
      </header>

      <main>
        {/* opening */}
        <section id="opening" className="op">
          <div className="op-one">
            <span className="l-rule op-rule" aria-hidden="true" />
            <p className="m-text-3 op-where l-b">
              <span>Infinite canvas</span>
              <span>Powered by Gemini</span>
            </p>
            <div className="op-head">
              <div className="op-name">
                <p className="m-text-3 op-what">Diagrams, mockups &amp; mindmaps</p>
                <h1 className="m-text-2 op-h1">
                  <span className="ln"><span className="ln__i">AI</span></span>{" "}
                  <span className="ln"><span className="ln__i">Whiteboard</span></span>
                </h1>
              </div>
              <p className="m-text-2 op-sub">
                <span className="ln l-a op-a"><span className="ln__i">Think it,</span></span>
                <span className="ln l-a op-a"><span className="ln__i">draw it,</span></span>
                <span className="ln l-b"><span className="ln__i">let the AI</span></span>
                <span className="ln l-b op-in"><span className="ln__i">finish it.</span></span>
              </p>
              <div className="op-foot">
                <div className="op-level" aria-hidden="true">
                  <span className="op-level__bubble" />
                </div>
                <div className="op-actions">
                  <Show when="signed-out">
                    <Link className="m-btn" href="/sign-up">
                      <span className="m-btn__label">Start free — 3 credits</span>
                    </Link>
                  </Show>
                  <Show when="signed-in">
                    <Link className="m-btn" href="/dashboard">
                      <span className="m-btn__label">Open dashboard</span>
                    </Link>
                  </Show>
                  <a className="m-link" href="#services">See what it draws</a>
                </div>
              </div>
            </div>
          </div>
          <div className="op-two">
            <ul className="op-tiles">
              {TILES.map((t) => (
                <li className="op-tile" key={t.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="m-photo"
                    style={{ background: t.bg }}
                    src={t.src}
                    alt={t.alt}
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
            <p className="m-text op-para l-b">
              Sketch freely, then prompt the assistant to turn a sentence into a
              diagram, flowchart, architecture map, mockup or mindmap — right on
              the same canvas. <a className="m-link-2" href="#workflow">See how it works</a>
            </p>
            <p className="m-text-2 op-say">
              <span className="ln"><span className="ln__i l-left">the</span><span className="ln__i">best ideas</span></span>
              <span className="ln l-a"><span className="ln__i">start as a</span></span>
              <span className="ln l-a"><span className="ln__i">rough sketch.</span></span>
            </p>
          </div>
        </section>

        {/* tools ledger */}
        <section id="services" className="sv">
          <h2 className="m-text-2 sv-h">
            <span className="l-a">Six tools,</span>
            <span className="l-b">one canvas</span>
            <span className="l-b sv-in">that draws for you.</span>
          </h2>
          <div className="sv-ledger">
            <span className="l-rule sv-rule" aria-hidden="true" data-motion="rule" />
            <div className="l-ledger sv-head m-text-3" aria-hidden="true">
              <span>Tool</span><span>You prompt</span><span>It returns</span><span>When</span>
            </div>
            <ul className="sv-rows">
              {TOOLS.map((row) => (
                <li className="l-ledger sv-row" key={row.name}>
                  <h3 className="m-text-4 sv-name">{row.name}</h3>
                  <p className="m-text sv-send" data-motion="post">
                    <span className="sr-only">You prompt: </span>{row.send}
                  </p>
                  <p className="m-text sv-return" data-motion="post" data-post="right">
                    <span className="sr-only">It returns: </span>{row.back}
                  </p>
                  <p className="m-text-3 sv-often">{row.often}</p>
                  <span className="sv-line" aria-hidden="true" data-motion="rule" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* workflow ruler */}
        <section id="workflow" className="mo" data-month>
          <div className="mo-stage">
            <h2 className="m-text-2 mo-h">
              <span className="l-a">From prompt</span>
              <span className="l-b">to scene,</span>
              <span className="l-b">in four moves.</span>
            </h2>
            <div className="mo-board">
              <div className="mo-scale" aria-hidden="true"><span className="mo-fill" /></div>
              <span className="mo-marker" aria-hidden="true" />
              <ol className="mo-tasks">
                {WORKFLOW.map((t) => (
                  <li className="mo-task" key={t.title}>
                    <p className="m-text-3 mo-day">{t.day}</p>
                    <h3 className="m-text-4">{t.title}</h3>
                    <p className="m-text">{t.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <p className="m-text-3 mo-note l-b">Autosave runs the whole way through.</p>
          </div>
        </section>

        {/* boards sphere */}
        <section id="boards" className="bs">
          <div className="bs-stage">
            <h2 className="m-text-2 bs-title">
              <span className="bs-half bs-half--a">Boards</span>{" "}
              <span className="bs-half bs-half--b">that draw themselves</span>
            </h2>
            <ul className="bs-globe" aria-label="Kinds of boards the assistant can create">
              {frames.map((card) => (
                <li
                  className="bs-card"
                  key={`${card.i}-${card.name}`}
                  style={{ ["--lat" as string]: `${card.lat}deg`, ["--lon" as string]: `${card.lon}deg` }}
                >
                  {card.kind === "photo" ? (
                    <div className="bs-face">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="m-photo" src={card.src} alt="" loading="lazy" />
                    </div>
                  ) : (
                    <div className="bs-face m-surface">
                      <span className="m-text-3">{card.name}</span>
                      <span className="m-text-3 bs-trade">{card.trade}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="m-text-3 bs-note">Sixteen kinds of board. Ask for yours.</p>
          </div>
        </section>

        {/* pricing */}
        <section id="prices" className="pr">
          <h2 className="m-text-2 pr-h">
            <span className="pr-l1"><span className="l-left">Simple</span>plans,</span>
            <span className="l-a">paid monthly.</span>
          </h2>
          <div className="pr-table">
            <div className="l-ledger pr-cols m-text-3" aria-hidden="true">
              <span>Plan</span><span>For</span><span>What is in it</span><span>Fee</span>
            </div>
            <ul className="pr-plans">
              {PLANS.map((plan) => (
                <li className="l-ledger pr-plan" key={plan.name}>
                  <h3 className="m-text-4 pr-name">
                    {plan.name}
                    {plan.badge ? <span className="pr-badge m-text-3"> · {plan.badge}</span> : null}
                  </h3>
                  <p className="m-text pr-for">{plan.for}</p>
                  <ul className="pr-items">
                    {plan.items.map((item) => (
                      <li className="m-text" key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="m-text-4 pr-fee" data-motion="post" data-post="right">
                    {plan.fee}
                    <span className="m-text-3">{plan.unit}</span>
                  </p>
                  <span className="pr-rule" aria-hidden="true" data-motion="rule" />
                </li>
              ))}
            </ul>
            <p className="m-text pr-note l-b">
              Start free with three AI credits. Upgrade, downgrade or leave in any
              month — no notice period, and your boards export whenever you want.
            </p>
          </div>
        </section>

        {/* getting started rings */}
        <section id="switch" className="sw" data-switch>
          <div className="sw-stage">
            <h2 className="m-text-2 sw-h">
              <span className="l-a">Your first board</span>
              <span className="l-b">takes about</span>
              <span className="l-b">a minute.</span>
            </h2>
            <div className="sw-body">
              <span className="l-rule sw-rule" aria-hidden="true" />
              <div className="sw-old">
                <p className="m-text-3">From sign-in to scene</p>
                <p className="m-text">
                  No install, no setup, no credit card. Sign in, describe what you
                  want and watch it appear on the canvas.
                </p>
              </div>
              <ol className="sw-tiles">
                {STEPS.map((s) => (
                  <li className="sw-tile m-surface-3" key={s.title}>
                    <svg className="sw-ring" viewBox="0 0 40 40" aria-hidden="true">
                      <circle className="sw-ring__track" cx="20" cy="20" r="17" />
                      <circle className="sw-ring__arc" cx="20" cy="20" r="17" pathLength="1" />
                    </svg>
                    <h3 className="m-text-4">{s.title}</h3>
                    <p className="m-text sw-text">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>{/* principle */}
        <section id="principle" className="pc">
          <p className="m-text-3 pc-cap l-b">The one rule behind every board</p>
          <blockquote className="m-text-2 pc-q">
            <span className="pc-l l-a">If you can</span>
            <span className="pc-l l-b">describe it,</span>
            <span className="pc-l l-a">you can</span>
            <span className="pc-l l-b pc-in">draw it<span className="pc-dot">.</span></span>
          </blockquote>
        </section>

        {/* faq */}
        <section id="faq" className="fq">
          <h2 className="m-text-2 fq-h">
            <span className="l-a">Questions</span>
            <span className="l-b">we hear</span>
            <span className="l-b">every week.</span>
          </h2>
          <div className="fq-list">
            {FAQS.map((item) => (
              <div className="fq-item" key={item.q}>
                <span className="fq-line" aria-hidden="true" data-motion="rule" />
                <details>
                  <summary className="m-text-4 fq-q">
                    <span>{item.q}</span>
                    <span className="fq-icon" aria-hidden="true" />
                  </summary>
                  <p className="m-text fq-a">{item.a}</p>
                </details>
              </div>
            ))}
          </div>
        </section>

        {/* reviews */}
        <section id="reviews" className="rv">
          <h2 className="m-text-2 rv-h">
            <span className="l-a">What people</span>
            <span className="l-b">make with it.</span>
          </h2>
          <ol className="rv-stack">
            {REVIEWS.map((r, i) => (
              <li
                className={`rv-sheet m-surface${i % 2 === 0 ? "" : "-2"}`}
                key={r.who}
                style={{ ["--i" as string]: i }}
              >
                <blockquote>
                  <p className="m-text-4 rv-quote">{r.quote}</p>
                </blockquote>
                <p className="m-text-3 rv-who">
                  <span>{r.who}</span>
                  <span>{r.where}</span>
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* contact */}
        <section id="contact" className="ct">
          <p className="m-text-2 ct-clock">
            <span aria-hidden="true">(</span>
            <span>always</span>
            <span className="ct-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="m-photo"
                src="https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.1.0&auto=format&fit=crop&w=150&q=60"
                alt="A notebook and pen on a desk"
                loading="lazy"
              />
            </span>
            <span>open</span>
            <span aria-hidden="true">)</span>
          </p>
          <p className="m-text-3 ct-days">Boards in the cloud, wherever you are</p>
          <div className="ct-grid">
            <span className="l-rule ct-rule" aria-hidden="true" />
            <dl className="ct-lines">
              <div data-motion="post">
                <dt className="m-text-3">Support</dt>
                <dd className="m-text"><a className="m-link" href="mailto:hello@ai-whiteboard.example">hello@ai-whiteboard.example</a></dd>
              </div>
              <div data-motion="post">
                <dt className="m-text-3">Status</dt>
                <dd className="m-text">All systems normal</dd>
              </div>
              <div data-motion="post">
                <dt className="m-text-3">Free plan</dt>
                <dd className="m-text">Three AI credits, no card required.</dd>
              </div>
            </dl>
            <div className="ct-right">
              <h2 className="m-text-2 ct-h">
                <span>Start drawing</span> <span className="ct-h2">today.</span>
              </h2>
              <form className="ct-form" action="#contact" method="post">
                <label className="m-field">
                  <span className="m-field__label">Your name</span>
                  <input className="m-field__input" name="name" type="text" autoComplete="name" required />
                </label>
                <label className="m-field">
                  <span className="m-field__label">Email</span>
                  <input className="m-field__input" name="email" type="email" autoComplete="email" required />
                </label>
                <label className="m-field ct-wide">
                  <span className="m-field__label">What are you building?</span>
                  <input className="m-field__input" name="business" type="text" />
                </label>
                <label className="m-field ct-wide">
                  <span className="m-field__label">Anything we should know</span>
                  <textarea className="m-field__input" name="message" rows={3} />
                </label>
                <div className="ct-send">
                  <button className="m-btn" type="submit">
                    <span className="m-btn__label">Create a free account</span>
                  </button>
                  <p className="m-text-3 ct-thanks" role="status" hidden>
                    Thank you — we will be in touch within one working day.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="ft">
        <div className="ft-inner">
          <div className="ft-top">
            <p className="m-text-3 ft-tag">
              AI Whiteboard<br />Diagrams, mockups and mindmaps, drawn by AI
            </p>
            <nav aria-label="Footer">
              <ul className="ft-links m-text">
                <li><a className="m-link" href="#services">Tools</a></li>
                <li><a className="m-link" href="#workflow">How it works</a></li>
                <li><a className="m-link" href="#boards">Boards</a></li>
                <li><a className="m-link" href="#prices">Pricing</a></li><li><a className="m-link" href="#faq">Questions</a></li>
                <li><a className="m-link" href="#contact">Contact</a></li>
              </ul>
            </nav>
            <ul className="ft-icons">
              <li>
                <a className="m-icon" href="mailto:hello@ai-whiteboard.example" aria-label="Write to us">
                  <svg className="m-icon__glyph" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3.5 6.5h17v11h-17z M3.5 7l8.5 6.5L20.5 7" />
                  </svg>
                </a>
              </li>
              <li>
                <Link className="m-icon" href="/dashboard" aria-label="Open the dashboard">
                  <svg className="m-icon__glyph" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
          <p className="m-text-2 ft-word">
            <span className="ft-a">{NAME_A}</span>
            <span className="ft-b">{NAME_B}</span>
          </p>
          <div className="ft-bottom m-text-3">
            <span>© 2026 AI Whiteboard · An Excalidraw + Gemini workspace</span>
            <a className="m-link" href="#opening">Back to the top</a>
          </div>
        </div>
        <div className="ghost m-text-2" aria-hidden="true">
          <span className="ghost__a">{NAME_A}</span>
          <span className="ghost__b">{NAME_B}</span>
        </div>
      </footer>
    </div>
  );
}
