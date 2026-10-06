import { site } from "@/content/site";
import styles from "./Shore.module.css";

type ApiCommit = { sha: string; html_url: string; commit: { message: string; author: { date: string } } };
type Entry = { sha: string; url: string; tag: string | null; text: string; day: string };

const SHOWN = 3;
const tags = /^(feat|fix|docs|refactor|chore|perf|test|style|build|ci)(?:\([^)]*\))?!?:\s*/i;
const dayName = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export function ActivityFallback({ loading = false }: { loading?: boolean }) {
  return <p className={styles.activityNote}>{loading ? "Loading the log…" : "The log is unavailable right now."} <a href={site.links.repo}>Read it on GitHub ↗</a></p>;
}

async function load(): Promise<ApiCommit[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  // Optional: a server-only token lifts GitHub's 60-requests-an-hour limit for shared hosting addresses.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com/repos/${site.repo}/commits?per_page=${SHOWN}`, { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(2500) });
  if (!response.ok) throw new Error("Commit log unavailable");
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid commit log");
  return data.filter((item): item is ApiCommit =>
    typeof item?.sha === "string" && /^[a-f0-9]{40}$/.test(item.sha)
    && typeof item.html_url === "string" && item.html_url.startsWith("https://github.com/")
    && typeof item.commit?.message === "string"
    && Number.isFinite(Date.parse(item.commit?.author?.date)));
}

/**
 * The studio's own commit log: the latest few commits, whenever they were made.
 * Deliberately no counts or activity chart, so a quiet stretch never reads as neglect.
 */
export default async function GitHubActivity() {
  let commits: ApiCommit[];
  try { commits = await load(); } catch { return <ActivityFallback />; }
  if (!commits.length) return <p className={styles.activityNote}>Nothing logged yet. <a href={site.links.repo}>Visit the repository ↗</a></p>;

  const entries: Entry[] = commits.slice(0, SHOWN).map(({ sha, html_url, commit }) => {
    const first = commit.message.split("\n")[0].trim();
    const match = first.match(tags);
    return { sha, url: html_url, tag: match ? match[1].toLowerCase() : null, text: match ? first.slice(match[0].length) : first, day: dayName.format(new Date(commit.author.date)) };
  });
  const groups: { day: string; items: Entry[] }[] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last?.day === entry.day) last.items.push(entry); else groups.push({ day: entry.day, items: [entry] });
  }

  return <>
    <ol className={styles.log}>{groups.map(group => <li key={group.day}>
      <p className={styles.logDay}>{group.day}</p>
      <ul>{group.items.map(item => <li key={item.sha}><a href={item.url}>
        {item.tag ? <span className={styles.tag}>{item.tag}</span> : null}
        <span className={styles.message}>{item.text}</span>
        <code>{item.sha.slice(0, 7)}</code>
      </a></li>)}</ul>
    </li>)}</ol>
    <p className={styles.activityNote}>Latest public commits to this site · dates in UTC · refreshed hourly</p>
  </>;
}
