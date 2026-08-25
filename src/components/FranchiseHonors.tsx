import { useEffect, useId, useRef, useState } from 'react'
import AssetImage from './AssetImage'
import { withBase } from '../lib/assetPath'
import { getManager, type FranchiseHonor } from '../data/league'

interface FranchiseHonorsProps {
  honors: FranchiseHonor[]
  stadiumName: string
  currentManagerId: string
}

type BannerToggleStyle = React.CSSProperties & {
  '--franchise-toggle-on': string
}

type BannerStyle = React.CSSProperties & {
  '--banner-body': string
  '--banner-border': string
  '--banner-bar': string
  '--banner-ink': string
  '--cloth-x': string
  '--cloth-y': string
  '--tilt-x': string
  '--tilt-y': string
  '--cloth-skew': string
  '--pointer-x': string
  '--pointer-y': string
  '--scroll-sway': string
  '--scroll-wave': string
  '--footer-sway': string
}

const CLOTH_TEXTURE = withBase('images/banner_cloth_texture.png')
const TROPHY_FALLBACK = withBase('images/LettyAward_trophy.png')

function BannerLogoFallback() {
  return (
    <img
      src={TROPHY_FALLBACK}
      alt=""
      aria-hidden="true"
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  )
}

function HonorBanner({
  honor,
  primaryColor,
  secondaryColor,
  tertiaryColor,
}: {
  honor: FranchiseHonor
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
}) {
  const clothRef = useRef<HTMLDivElement>(null)
  const rippleFrameRef = useRef(0)
  const rippleNodesRef = useRef(Array.from({ length: 12 }, () => ({ offset: 0, velocity: 0 })))
  const bodyColor = primaryColor
  const borderColor = honor.managerId === 'pb' ? tertiaryColor : secondaryColor
  const usesWhiteInk = ['brice', 'whitaker', 'kyle'].includes(honor.managerId)
  const inkColor = usesWhiteInk ? '#ffffff' : secondaryColor
  const logoScale = (() => {
    if (honor.kind === 'division') return 0.51
    if (honor.kind === 'letty') return 0.35
    if (honor.year === 2020) return 0.85

    let scale = 1
    if (honor.name.includes('Voltron Global Bowl')) scale *= 0.6
    else if (honor.name.includes('Tokyo Drift Bowl')) scale *= 0.75
    else if (honor.name.includes('Lemon Pepper Wing Bowl')) scale *= 0.5
    return scale
  })()
  const logoFilter = honor.kind === 'division'
    ? 'drop-shadow(0 0 1px rgba(255,255,255,.95)) drop-shadow(0 2px 2px rgba(0,0,0,.45))'
    : undefined

  function startRipplePhysics() {
    if (rippleFrameRef.current) return
    let previousTime = performance.now()

    function tick(now: number) {
      const cloth = clothRef.current
      if (!cloth) {
        rippleFrameRef.current = 0
        return
      }

      const elapsed = Math.min(2, (now - previousTime) / 16.667)
      previousTime = now
      const nodes = rippleNodesRef.current
      let isMoving = false

      // A compact one-dimensional cloth solver: neighboring bands constrain
      // one another, the top is pinned, and the weighted bottom damps slower.
      for (let pass = 0; pass < 2; pass += 1) {
        for (let index = 1; index < nodes.length; index += 1) {
          const node = nodes[index]
          const above = nodes[index - 1].offset
          const below = nodes[index + 1]?.offset ?? node.offset
          const neighborPull = ((above + below) * 0.5 - node.offset) * 0.2
          const returnPull = -node.offset * (index === nodes.length - 1 ? 0.045 : 0.075)
          node.velocity += (neighborPull + returnPull) * elapsed
          node.velocity *= Math.pow(index === nodes.length - 1 ? 0.9 : 0.84, elapsed)
          node.offset += node.velocity * elapsed
          node.offset = Math.max(-12, Math.min(12, node.offset))
          isMoving ||= Math.abs(node.offset) > 0.025 || Math.abs(node.velocity) > 0.025
        }
      }

      // Keep the mounting edge attached to its rail.
      nodes[0].offset = 0
      nodes[0].velocity = 0

      cloth.querySelectorAll<HTMLElement>('.honor-banner__ripple-strip').forEach((strip, index) => {
        const offset = nodes[index]?.offset ?? 0
        const nextOffset = nodes[index + 1]?.offset ?? offset
        const skew = (nextOffset - offset) * 0.22
        strip.style.transform = `translate3d(${offset}px, 0, 0) skewX(${skew}deg) scaleX(${1 + Math.abs(offset) * 0.0015})`
        strip.style.opacity = String(0.1 + Math.min(0.26, Math.abs(offset) * 0.025))
      })

      if (isMoving) {
        rippleFrameRef.current = window.requestAnimationFrame(tick)
      } else {
        rippleFrameRef.current = 0
      }
    }

    rippleFrameRef.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => () => {
    if (rippleFrameRef.current) window.cancelAnimationFrame(rippleFrameRef.current)
  }, [])

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cloth = clothRef.current
    if (!cloth) return
    const bounds = cloth.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    const nx = x * 2 - 1
    const ny = y * 2 - 1

    cloth.style.setProperty('--cloth-x', `${50 + nx * 7}%`)
    cloth.style.setProperty('--cloth-y', `${50 + ny * 7}%`)
    cloth.style.setProperty('--tilt-x', `${ny * -2.2}deg`)
    cloth.style.setProperty('--tilt-y', `${nx * 3}deg`)
    cloth.style.setProperty('--cloth-skew', `${nx * 0.8}deg`)
    cloth.style.setProperty('--pointer-x', `${x * 100}%`)
    cloth.style.setProperty('--pointer-y', `${y * 100}%`)

    const pointerSpeed = Math.max(-8, Math.min(8, event.movementX * 0.16))
    rippleNodesRef.current.forEach((node, index, nodes) => {
      const stripCenter = (index + 0.5) / nodes.length
      const distance = stripCenter - y
      const falloff = Math.exp(-Math.abs(distance) * 5.5)
      const wave = Math.sin(distance * 25 - nx * 3.5)
      node.velocity += (wave * (2.2 + Math.abs(nx) * 2.8) + nx * 1.8 + pointerSpeed) * falloff
    })
    startRipplePhysics()
  }

  function resetPointerRipple() {
    const cloth = clothRef.current
    if (!cloth) return
    cloth.style.setProperty('--cloth-x', '50%')
    cloth.style.setProperty('--cloth-y', '50%')
    cloth.style.setProperty('--tilt-x', '0deg')
    cloth.style.setProperty('--tilt-y', '0deg')
    cloth.style.setProperty('--cloth-skew', '0deg')
    cloth.style.setProperty('--pointer-x', '50%')
    cloth.style.setProperty('--pointer-y', '42%')
    startRipplePhysics()
  }

  const style: BannerStyle = {
    '--banner-body': bodyColor,
    '--banner-border': borderColor,
    '--banner-bar': tertiaryColor,
    '--banner-ink': inkColor,
    '--cloth-x': '50%',
    '--cloth-y': '50%',
    '--tilt-x': '0deg',
    '--tilt-y': '0deg',
    '--cloth-skew': '0deg',
    '--pointer-x': '50%',
    '--pointer-y': '42%',
    '--scroll-sway': '0deg',
    '--scroll-wave': '0deg',
    '--footer-sway': '0deg',
  }

  return (
    <article
      className="honor-banner"
      aria-label={`${honor.name}, ${honor.year}${honor.seasonFlag ? `, ${honor.seasonFlag}` : ''}`}
      style={style}
    >
      <div className="honor-banner__mount" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div
        ref={clothRef}
        className="honor-banner__cloth"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointerRipple}
        style={{ backgroundColor: bodyColor, backgroundImage: `url(${CLOTH_TEXTURE})` }}
      >
        <div className="honor-banner__texture" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="honor-banner__ripple-strip"
              style={{ backgroundImage: `url(${CLOTH_TEXTURE})` }}
            />
          ))}
        </div>
        <div className="honor-banner__shade" aria-hidden="true" />

        <div className="honor-banner__content">
          <div className="honor-banner__logo">
            {honor.logoPath ? (
              <AssetImage
                src={honor.logoPath}
                alt={`${honor.name} logo`}
                width={180}
                height={152}
                style={{ width: '100%', height: '100%', transform: `scale(${logoScale})`, filter: logoFilter }}
                fallback={<BannerLogoFallback />}
              />
            ) : (
              <BannerLogoFallback />
            )}
          </div>

          <h3>{honor.name}</h3>
          <div className="honor-banner__year">
            {honor.year}{honor.seasonFlag ? '*' : ''}
          </div>
          {honor.seasonFlag && <span className="honor-banner__season-flag">{honor.seasonFlag}</span>}
        </div>

        <div className="honor-banner__weight" aria-hidden="true" />
      </div>
    </article>
  )
}

export default function FranchiseHonors({ honors, stadiumName, currentManagerId }: FranchiseHonorsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const gridId = useId()

  useEffect(() => {
    if (honors.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let lastScrollY = window.scrollY
    let angle = 0
    let velocity = 0
    let frame = 0

    function applySway() {
      sectionRef.current?.querySelectorAll<HTMLElement>('.honor-banner').forEach((banner, index) => {
        const direction = index % 2 === 0 ? 1 : -1
        const weight = 0.78 + (index % 3) * 0.14
        banner.style.setProperty('--scroll-sway', `${angle * direction * weight}deg`)
        banner.style.setProperty('--scroll-wave', `${angle * direction * weight * 0.34}deg`)
        banner.style.setProperty('--footer-sway', `${angle * direction * weight * -0.3}deg`)
      })
    }

    function tick() {
      velocity += -angle * 0.075
      velocity *= 0.82
      angle += velocity
      angle = Math.max(-2.8, Math.min(2.8, angle))
      applySway()

      if (Math.abs(angle) > 0.015 || Math.abs(velocity) > 0.015) {
        frame = window.requestAnimationFrame(tick)
      } else {
        angle = 0
        velocity = 0
        applySway()
        frame = 0
      }
    }

    function handleScroll() {
      const nextScrollY = window.scrollY
      const delta = nextScrollY - lastScrollY
      lastScrollY = nextScrollY
      velocity += Math.max(-1.2, Math.min(1.2, delta * 0.018))
      if (!frame) frame = window.requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [honors.length])

  if (honors.length === 0) return null
  const currentManager = getManager(currentManagerId)
  const toggleStyle: BannerToggleStyle = {
    '--franchise-toggle-on': currentManager?.primaryColor ?? '#42be65',
  }
  const seasonNotes = [
    honors.some(honor => honor.year === 2013) ? '2013 was a half season (NFL weeks 7–14).' : null,
    honors.some(honor => honor.year === 2020) ? '2020 was the COVID season.' : null,
  ].filter((note): note is string => Boolean(note))

  return (
    <section ref={sectionRef} className="franchise-honors" aria-labelledby="franchise-honors-title">
      <div className="franchise-honors__heading-row">
        <h2 id="franchise-honors-title">Hanging in {stadiumName}</h2>
        <div className="franchise-honors__toggle-field">
          <span className="franchise-honors__toggle-label">Show banners</span>
          <button
            type="button"
            role="switch"
            className="franchise-honors__toggle"
            style={toggleStyle}
            aria-checked={isVisible}
            aria-controls={gridId}
            aria-expanded={isVisible}
            aria-label={`${isVisible ? 'Hide' : 'Show'} banners hanging in ${stadiumName}`}
            onClick={() => setIsVisible(visible => !visible)}
          >
            <span className="franchise-honors__toggle-track" aria-hidden="true">
              <span className="franchise-honors__toggle-handle" />
            </span>
            <span className="franchise-honors__toggle-state" aria-hidden="true">
              {isVisible ? 'On' : 'Off'}
            </span>
          </button>
        </div>
      </div>
      <div id={gridId} hidden={!isVisible}>
        <div className="franchise-honors__grid">
          {honors.map(honor => {
            const winningManager = getManager(honor.managerId)
            return (
              <HonorBanner
                key={honor.id}
                honor={honor}
                primaryColor={winningManager?.primaryColor ?? '#f4f4f4'}
                secondaryColor={winningManager?.secondaryColor ?? '#161616'}
                tertiaryColor={winningManager?.tertiaryColor ?? '#525252'}
              />
            )
          })}
        </div>
      </div>
      {isVisible && seasonNotes.length > 0 && (
        <p className="franchise-honors__asterisk">
          * {seasonNotes.join(' ')}
        </p>
      )}

      <style>{`
        .franchise-honors {
          padding: 40px 8px 16px;
          overflow: hidden;
        }
        .franchise-honors__heading-row {
          min-height: 48px;
          margin: 0 0 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid #393939;
        }
        .franchise-honors__heading-row > h2 {
          margin: 0 0 16px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 28px;
          line-height: 32px;
          font-weight: 400;
          color: #f4f4f4;
        }
        .franchise-honors__toggle-field {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        .franchise-honors__toggle-label {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          font-weight: 400;
          color: #c6c6c6;
        }
        .franchise-honors__toggle {
          --franchise-toggle-on: #42be65;
          min-width: 80px;
          min-height: 32px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          border: 0;
          background: transparent;
          color: #f4f4f4;
          cursor: pointer;
        }
        .franchise-honors__toggle-track {
          position: relative;
          width: 48px;
          height: 24px;
          flex: 0 0 48px;
          border-radius: 12px;
          background: #8d8d8d;
          transition: background-color 120ms cubic-bezier(.2, 0, .38, .9);
        }
        .franchise-honors__toggle-handle {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #f4f4f4;
          transition: transform 120ms cubic-bezier(.2, 0, .38, .9);
        }
        .franchise-honors__toggle[aria-checked='true'] .franchise-honors__toggle-track {
          background: var(--franchise-toggle-on);
        }
        .franchise-honors__toggle[aria-checked='true'] .franchise-honors__toggle-handle {
          transform: translateX(24px);
        }
        .franchise-honors__toggle-state {
          min-width: 24px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          line-height: 18px;
          font-weight: 400;
          text-align: left;
        }
        .franchise-honors__toggle:hover .franchise-honors__toggle-track { filter: brightness(.9); }
        .franchise-honors__toggle:focus-visible { outline: none; }
        .franchise-honors__toggle:focus-visible .franchise-honors__toggle-track {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }
        .franchise-honors__grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 32px 16px;
          align-items: start;
        }
        .honor-banner {
          --banner-body: #f4f4f4;
          --banner-border: #200000;
          --banner-bar: #cc0000;
          --banner-ink: #200000;
          --scroll-sway: 0deg;
          --footer-sway: 0deg;
          --scroll-wave: 0deg;
          width: 100%;
          max-width: 280px;
          margin: 0 auto;
          padding-top: 16px;
          position: relative;
          perspective: 900px;
          transform-style: preserve-3d;
        }
        .honor-banner__mount {
          position: absolute;
          z-index: 4;
          top: 6px;
          left: 0;
          right: 0;
          height: 10px;
          border: 1px solid var(--banner-border);
          background-color: var(--banner-bar);
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
        }
        .honor-banner__mount > span {
          width: 12px;
          height: 18px;
          border: 2px solid var(--banner-border);
          background-color: var(--banner-bar);
        }
        .honor-banner__cloth {
          position: relative;
          z-index: 2;
          width: calc(100% - 16px);
          aspect-ratio: 3 / 4;
          margin: 0 auto;
          overflow: visible;
          border: 8px solid var(--banner-border);
          border-left-width: 22px;
          border-right-width: 22px;
          border-left-color: var(--banner-border);
          border-right-color: var(--banner-border);
          background-color: var(--banner-body);
          background-repeat: repeat;
          background-size: 192px 192px;
          background-position: var(--cloth-x) var(--cloth-y);
          background-blend-mode: multiply;
          box-shadow:
            inset 12px 0 18px rgba(0, 0, 0, 0.12),
            inset -10px 0 16px rgba(255, 255, 255, 0.15),
            inset 0 -20px 28px rgba(0, 0, 0, 0.1);
          transform-origin: 50% 0;
          transform: rotateZ(var(--scroll-sway)) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) skewX(calc(var(--cloth-skew) + var(--scroll-wave)));
          transition: transform 110ms cubic-bezier(0.2, 0, 0.38, 0.9), background-position 90ms linear, box-shadow 140ms ease;
          will-change: transform, background-position;
        }
        .honor-banner__texture {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
          pointer-events: none;
        }
        .honor-banner__ripple-strip {
          display: block;
          height: 8.3334%;
          width: 100%;
          background-size: 192px 192px;
          background-position: var(--cloth-x) var(--cloth-y);
          background-blend-mode: multiply;
          mix-blend-mode: multiply;
          opacity: 0.1;
          transition: transform 95ms ease-out, opacity 95ms ease-out;
          will-change: transform;
        }
        .honor-banner__shade {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(255,255,255,.48) 0, rgba(255,255,255,.2) 9%, transparent 28%),
            radial-gradient(circle at calc(var(--pointer-x) + 8%) calc(var(--pointer-y) + 8%), rgba(0,0,0,.24) 0, rgba(0,0,0,.08) 13%, transparent 34%),
            repeating-linear-gradient(90deg, rgba(255,255,255,.16) 0, transparent 7%, rgba(0,0,0,.13) 14%, transparent 22%);
          background-size: auto, auto, 76px 100%;
          mix-blend-mode: soft-light;
          opacity: .9;
          transition: background-position 90ms linear, opacity 140ms ease;
        }
        .honor-banner__cloth:hover .honor-banner__shade { opacity: 1; }
        .honor-banner__content {
          position: relative;
          z-index: 3;
          height: 100%;
          min-height: 0;
          display: grid;
          grid-template-rows: minmax(0, 1fr) auto auto auto;
          justify-items: center;
          align-items: center;
          gap: 8px;
          padding: 20px 12px 28px;
          color: var(--banner-ink);
        }
        .honor-banner__logo {
          width: 100%;
          min-height: 0;
          padding: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .honor-banner h3 {
          min-height: 48px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-align: center;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }
        .honor-banner__year {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 32px;
          line-height: 40px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.03em;
        }
        .honor-banner__season-flag {
          min-height: 20px;
          padding: 2px 6px;
          border: 1px solid var(--banner-border);
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          color: var(--banner-ink);
        }
        .honor-banner__weight {
          position: absolute;
          z-index: 5;
          left: -14px;
          right: -14px;
          bottom: -10px;
          height: 12px;
          border: 1px solid var(--banner-border);
          background-color: var(--banner-bar);
          transform-origin: 50% 50%;
          transform: rotateZ(var(--footer-sway));
          transition: transform 100ms linear;
        }
        .franchise-honors__asterisk {
          margin: 32px 0 0;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px;
          line-height: 16px;
          color: #8d8d8d;
        }
        @media (min-width: 480px) {
          .franchise-honors__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 672px) {
          .franchise-honors__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 1056px) {
          .franchise-honors__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 40px 24px; }
        }
        @media (min-width: 1312px) {
          .franchise-honors__grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
        }
        @media (min-width: 1584px) {
          .franchise-honors__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        }
        @media (max-width: 671px) {
          .franchise-honors { padding: 32px 0 8px; }
          .franchise-honors__heading-row > h2 { font-size: 20px; line-height: 28px; }
          .franchise-honors__heading-row { align-items: flex-start; gap: 16px; }
          .honor-banner { max-width: 248px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .honor-banner__cloth,
          .honor-banner__weight,
          .honor-banner__ripple-strip {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}
