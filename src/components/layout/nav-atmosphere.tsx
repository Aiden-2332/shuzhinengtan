"use client";

import { memo, useCallback, useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { MeshGradient } from "@paper-design/shaders-react";
import Particles, {
  ParticlesProvider,
  type IParticlesProps,
  type ParticlesPluginRegistrar,
} from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { CockpitTheme } from "./theme-switcher";

const THEME_COLORS: Record<CockpitTheme, [string, string, string, string]> = {
  aurora: ["#07151d", "#0c3a45", "#167382", "#b08e51"],
  ocean: ["#081226", "#102d57", "#265f9e", "#b27a30"],
  verdant: ["#071914", "#164434", "#2e7653", "#9c8742"],
  sunrise: ["#22120d", "#5d2c1c", "#9d5731", "#315e78"],
};

interface NavAtmosphereProps {
  theme: CockpitTheme;
  staticMode?: boolean;
}

function NavAtmosphereComponent({ theme, staticMode = false }: NavAtmosphereProps) {
  const reduceMotion = useReducedMotion();
  const colors = THEME_COLORS[theme];
  const initParticles = useCallback<ParticlesPluginRegistrar>(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo<NonNullable<IParticlesProps["options"]>>(() => ({
    fullScreen: { enable: false },
    fpsLimit: reduceMotion ? 1 : 36,
    detectRetina: true,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    background: { color: { value: "transparent" } },
    particles: {
      color: { value: [colors[2], colors[3], "#ffffff"] },
      links: {
        enable: !reduceMotion,
        color: colors[2],
        distance: 82,
        opacity: 0.09,
        width: 0.6,
      },
      move: {
        enable: !reduceMotion,
        direction: "right",
        random: true,
        speed: 0.32,
        straight: false,
        outModes: { default: "out" },
      },
      number: {
        value: reduceMotion ? 0 : 30,
        density: { enable: true, width: 1120, height: 56 },
      },
      opacity: {
        value: { min: 0.12, max: 0.42 },
        animation: { enable: !reduceMotion, speed: 0.45, sync: false },
      },
      size: { value: { min: 0.6, max: 1.8 } },
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: !reduceMotion, mode: "repulse" },
        resize: { enable: true },
      },
      modes: { repulse: { distance: 54, duration: 0.45, speed: 0.4 } },
    },
  }), [colors, reduceMotion]);

  if (staticMode) {
    return <div className="nav-atmosphere nav-atmosphere--static" aria-hidden="true" />;
  }

  return (
    <div className="nav-atmosphere" aria-hidden="true">
      <MeshGradient
        className="nav-atmosphere__gradient"
        colors={colors}
        distortion={0.54}
        swirl={0.34}
        speed={reduceMotion ? 0 : 0.13}
        grainMixer={0.04}
        grainOverlay={0.03}
        maxPixelCount={380_000}
      />
      {reduceMotion ? null : (
        <ParticlesProvider init={initParticles}>
          <Particles
            id="navigation-particles"
            className="nav-atmosphere__particles"
            options={options}
          />
        </ParticlesProvider>
      )}
      <div className="nav-atmosphere__flow" />
    </div>
  );
}

export const NavAtmosphere = memo(NavAtmosphereComponent);
