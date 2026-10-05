import { site } from "@/content/site";
import styles from "./Shore.module.css";

type PublicEvent={id:string;type:string;repo:{name:string};created_at:string;public:boolean};
const actions:Record<string,string>={PushEvent:"Pushed code",CreateEvent:"Created a ref",PullRequestEvent:"Pull request activity",IssuesEvent:"Issue activity",ReleaseEvent:"Published a release",WatchEvent:"Starred a repository",ForkEvent:"Forked a repository"};

export function ActivityFallback({loading=false}:{loading?:boolean}) {
  return <p className={styles.activityNote}>{loading?"Loading the public log…":"The public log is unavailable right now."} <a href={site.links.github}>Visit ctrl-alt-yash ↗</a></p>;
}

export default async function GitHubActivity() {
  let events:PublicEvent[] | null = null;
  try {
    const response=await fetch("https://api.github.com/users/ctrl-alt-yash/events/public?per_page=12",{headers:{Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2026-03-10"},next:{revalidate:3600},signal:AbortSignal.timeout(2500)});
    if(!response.ok)throw new Error("Public activity unavailable");
    const data:unknown=await response.json();
    if(!Array.isArray(data))throw new Error("Invalid public activity");
    events=data.filter((event):event is PublicEvent=>event&&event.public===true&&typeof event.id==="string"&&typeof event.type==="string"&&typeof event.created_at==="string"&&Number.isFinite(Date.parse(event.created_at))&&typeof event.repo?.name==="string"&&/^[\w.-]+\/[\w.-]+$/.test(event.repo.name)).slice(0,3);
  }catch{events=null;}
  if(events===null)return <ActivityFallback />;
  if(!events.length)return <p className={styles.activityNote}>No recent public events. <a href={site.links.github}>Explore the repositories ↗</a></p>;
  return <><ol className={styles.events}>{events.map(event=><li key={event.id}><a href={`https://github.com/${event.repo.name}`}><span>{actions[event.type]??"Public activity"}</span><strong>{event.repo.name}</strong><time dateTime={event.created_at}>{new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"UTC"}).format(new Date(event.created_at))} UTC</time></a></li>)}</ol><p className={styles.activityNote}>Public events · refreshed hourly · may be delayed</p></>;
}
