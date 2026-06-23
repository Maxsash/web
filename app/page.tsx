export default function Home() {
  return (
    <div>
      <div className="scene">
        <div className="wave-layer layer-far">
          <svg
            viewBox="0 0 1440 160"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 C180,40 360,120 540,80 C720,40 900,120 1080,80 C1260,40 1350,100 1440,80 L1440,160 L0,160 Z"
              fill="#b8e6ee"
            />
          </svg>
        </div>

        <div className="wave-layer layer-mid">
          <svg
            viewBox="0 0 1440 140"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 C1320,40 1390,80 1440,60 L1440,140 L0,140 Z"
              fill="#2BA7C7"
            />
          </svg>
        </div>

        <div className="logo layer-logo">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 8334 8334"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlSpace="preserve"
            style={{
              fillRule: "evenodd",
              clipRule: "evenodd",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeMiterlimit: 1.5,
            }}
          >
            <g transform="matrix(4.166667,0,0,4.166667,0,0)">
              <rect
                x="0"
                y="0"
                width="2000"
                height="2000"
                style={{ fill: "none" }}
              />

              <g>
                <g transform="matrix(418.592602,18.245463,18.245463,-418.592602,925.432495,947.385428)">
                  <path
                    d="M0.126,0.681C0.124,0.684 0.073,0.044 0.073,0.044L0,-0.685L0.39,-0.629L0.996,-0.479C0.996,-0.479 0.907,-0.207 0.836,0.008C0.781,0.175 0.671,0.319 0.525,0.416C0.346,0.535 0.126,0.681 0.126,0.681Z"
                    style={{
                      fill: "rgb(47,112,186)",
                      fillRule: "nonzero",
                    }}
                  />
                </g>

                <g transform="matrix(-313.887634,999.910095,999.910095,313.887634,977.761196,447.401563)">
                  <path
                    d="M0.049,0.045C0.102,-0.035 0.236,-0.028 0.32,-0.019C0.47,-0.001 0.621,0.029 0.772,0.051C0.815,0.057 0.861,0.064 0.905,0.06C0.934,0.057 0.951,0.005 0.951,0.005C0.948,0.004 0.938,-0.004 0.935,-0.006C0.874,-0.055 0.944,-0.146 1.013,-0.093C1.061,-0.056 1.052,0.022 1.017,0.065C0.939,0.161 0.77,0.138 0.662,0.121C0.526,0.101 0.39,0.074 0.254,0.054C0.214,0.049 0.141,0.036 0.107,0.059C0.093,0.068 0.101,0.065 0.107,0.067C0.17,0.092 0.148,0.176 0.087,0.169C0.035,0.163 0.022,0.115 0.035,0.073C0.038,0.064 0.043,0.054 0.049,0.045Z"
                    style={{
                      fill: "rgb(47,112,186)",
                      fillRule: "nonzero",
                    }}
                  />
                </g>

                <g transform="matrix(0.24,0,0,0.24,0,0)">
                  <path
                    d="M2722.681,5874.771L2417.975,5848.65"
                    style={{
                      fill: "none",
                      stroke: "black",
                      strokeWidth: 1,
                    }}
                  />
                </g>

                <g transform="matrix(707.990051,0,0,-707.990051,802.992981,1313.154788)">
                  <path
                    d="M0.389,0.09L0.137,0.063L0.134,0.06C0.114,-0.021 0.086,-0.1 0.038,-0.168C0.026,-0.185 0.012,-0.2 0,-0.217L0.685,-0.217L1,0.217L0.389,0.09Z"
                    style={{
                      fill: "rgb(47,112,186)",
                      fillRule: "nonzero",
                    }}
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>

        <div className="wave-layer layer-near">
          <svg
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 C160,20 320,80 480,50 C640,20 800,80 960,50 C1120,20 1300,70 1440,50 L1440,120 L0,120 Z"
              fill="#1E5565"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}