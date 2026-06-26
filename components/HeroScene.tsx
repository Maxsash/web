import styles from "./HeroScene.module.css";

export default function HeroScene() {
  return (
    <div className={styles.scene}>

      {/* ── Far layer: period=720px, 2 cycles → tiled to 2880 ── */}
      <div
        className={`${styles.waveLayer} ${styles.layerFar}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 2880 180"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          focusable="false"
        >
          {/*
            One cycle: M0,80 C180,40 540,120 720,80
            Control points at P/4 and 3P/4 keep slopes symmetric,
            so the seam at x=0 / x=1440 is C¹ continuous.
          */}
          <path d="
            M0,80
            C180,25  540,135  720,80
            C900,25  1260,135 1440,80
            C1620,25 1980,135 2160,80
            C2340,25 2700,135 2880,80
            L2880,180 L0,180 Z
          " />
        </svg>
      </div>

      {/* ── Mid layer: period=480px, 3 cycles → tiled to 2880 ── */}
      <div
        className={`${styles.waveLayer} ${styles.layerMid}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 2880 160"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="
            M0,60
            C120,10  360,110  480,60
            C600,10  840,110  960,60
            C1080,10 1320,110 1440,60
            C1560,10 1800,110 1920,60
            C2040,10 2280,110 2400,60
            C2520,10 2760,110 2880,60
            L2880,160 L0,160 Z
          " />
        </svg>
      </div>

      {/* ── Logo layer — unchanged ── */}
      <div className={`${styles.logo} ${styles.layerLogo}`} aria-hidden="true">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 8334 8334"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          xmlSpace="preserve"
          focusable="false"
        >
          <g transform="matrix(4.166667,0,0,4.166667,0,2000)">
            <g transform="matrix(418.592602,18.245463,18.245463,-418.592602,925.432495,947.385428)">
              <path fillRule="nonzero" d="M0.126,0.681C0.124,0.684 0.073,0.044 0.073,0.044L0,-0.685L0.39,-0.629L0.996,-0.479C0.996,-0.479 0.907,-0.207 0.836,0.008C0.781,0.175 0.671,0.319 0.525,0.416C0.346,0.535 0.126,0.681 0.126,0.681Z" />
            </g>
            <g transform="matrix(-313.887634,999.910095,999.910095,313.887634,977.761196,447.401563)">
              <path fillRule="nonzero" d="M0.049,0.045C0.102,-0.035 0.236,-0.028 0.32,-0.019C0.47,-0.001 0.621,0.029 0.772,0.051C0.815,0.057 0.861,0.064 0.905,0.06C0.934,0.057 0.951,0.005 0.951,0.005C0.948,0.004 0.938,-0.004 0.935,-0.006C0.874,-0.055 0.944,-0.146 1.013,-0.093C1.061,-0.056 1.052,0.022 1.017,0.065C0.939,0.161 0.77,0.138 0.662,0.121C0.526,0.101 0.39,0.074 0.254,0.054C0.214,0.049 0.141,0.036 0.107,0.059C0.093,0.068 0.101,0.065 0.107,0.067C0.17,0.092 0.148,0.176 0.087,0.169C0.035,0.163 0.022,0.115 0.035,0.073C0.038,0.064 0.043,0.054 0.049,0.045Z" />
            </g>
            <g transform="matrix(0.24,0,0,0.24,0,0)">
              <path d="M2722.681,5874.771L2417.975,5848.65" style={{ fill: "none", stroke: "black", strokeWidth: 1 }} />
            </g>
            <g transform="matrix(707.990051,0,0,-707.990051,802.992981,1313.154788)">
              <path fillRule="nonzero" d="M0.389,0.09L0.137,0.063L0.134,0.06C0.114,-0.021 0.086,-0.1 0.038,-0.168C0.026,-0.185 0.012,-0.2 0,-0.217L0.685,-0.217L1,0.217L0.389,0.09Z" />
            </g>
          </g>
        </svg>
      </div>

      {/* ── Near layer: period=360px, 4 cycles → tiled to 2880 ── */}
      <div
        className={`${styles.waveLayer} ${styles.layerNear}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 2880 140"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="
            M0,50
            C90,10   270,100   360,50
            C450,10  630,100   720,50
            C810,10  990,100   1080,50
            C1170,10 1350,100  1440,50
            C1530,20 1710,100  1800,50
            C1890,20 2070,100  2160,50
            C2250,20 2430,100  2520,50
            C2610,20 2790,100  2880,50
            L2880,140 L0,140 Z
          " />
        </svg>
      </div>

    </div>
  );
}