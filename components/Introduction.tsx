import styles from './Introduction.module.css';

export default function Introduction() {
  return (
     <div>

        <div className={styles['hero-content']}>
          <p className={styles['eyebrow']}>
            Software • Games • Automation
          </p>

          <h1 className={styles['hero-title']}>
            MAXSASH
          </h1>

          <p className={styles['subtitle']}>
            Crafting software with the patience of a shipwright.
            Apps, games, and tools built to last.
          </p>

          <div className={styles['hero-buttons']}>
            <a href="#projects" className={styles['primary']}>
              Explore Projects
            </a>

            <a href="#about" className={styles['secondary']}>
              About Me
            </a>
          </div>
        </div>
        </div>
  );
}