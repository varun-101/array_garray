import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const StatusChip = ({ status = "In Progress" }) => {
    const isCompleted = status === "Completed";
    return (
        <span className={`shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
            isCompleted ? "bg-mint/20 text-mint" : "bg-white/10 text-white"
        }`}>
            {status}
        </span>
    );
};

const ProgressBar = ({ percent = 0, colorClass = "bg-royal" }) => {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    return (
        <div className="mt-3">
            <div className="text-xs text-neutral-400 mb-1">Completion</div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                    className={`h-full ${colorClass}`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
            <div className="mt-1 text-right text-xs text-neutral-400">{clamped}%</div>
        </div>
    );
};

const RepoCard = ({ repo, status, completion, accent = "bg-royal" }) => {
    return (
        <div className="p-5 rounded-2xl bg-gradient-to-b from-storm to-indigo hover:-translate-y-1 duration-200">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <a
                        href={repo.githubUrl || repo.html_url || repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lg font-semibold text-white hover:underline"
                    >
                        {repo.name || repo.fullName || "Repository"}
                    </a>
                    {repo.description ? (
                        <p className="mt-2 text-sm text-neutral-300">
                            {repo.description}
                        </p>
                    ) : null}
                </div>
                <StatusChip status={status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                {repo.language ? (
                    <span className="rounded-full border border-white/10 px-2 py-1">
                        {repo.language}
                    </span>
                ) : null}
                {typeof repo.stars === "number" || typeof repo.stargazers_count === "number" ? (
                    <span className="rounded-full border border-white/10 px-2 py-1">
                        ⭐ {repo.stars ?? repo.stargazers_count}
                    </span>
                ) : null}
                {typeof repo.forks === "number" ? (
                    <span className="rounded-full border border-white/10 px-2 py-1">
                        🍴 {repo.forks}
                    </span>
                ) : null}
                <span className="rounded-full border border-white/10 px-2 py-1">
                    <img src="/assets/logos/github.svg" alt="GitHub" className="h-3 w-3 inline mr-1" />
                    Repo
                </span>
            </div>
            <ProgressBar percent={completion} colorClass={accent} />
            <div className="mt-4">
                <a
                    href={repo.githubUrl || repo.html_url || repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                    View Project
                    <img src="/assets/arrow-right.svg" alt="arrow-right" className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};

const MyProjects = () => {
    const { user, accessToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [repos, setRepos] = useState([]);

    const githubId = useMemo(() => (user?.githubId ?? user?.id ?? null), [user]);

    useEffect(() => {
        let ignore = false;
        async function fetchRepos() {
            if (!githubId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError("");
            try {
                // Prefer backend-stored repos; fall back to GitHub API with token
                const viaBackend = await fetch(`/api/users/${githubId}/repos`, {
                    headers: { "Accept": "application/json" }
                });
                if (!ignore && viaBackend.ok) {
                    const data = await viaBackend.json();
                    const list = Array.isArray(data?.data) ? data.data : [];
                    if (list.length > 0) {
                        setRepos(list);
                        setLoading(false);
                        return;
                    }
                }

                // fallback: direct GitHub API (only if token present)
                if (accessToken) {
                    const ghRes = await fetch("https://api.github.com/user/repos?per_page=100", {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    if (!ignore && ghRes.ok) {
                        const gh = await ghRes.json();
                        setRepos(gh);
                        setLoading(false);
                        return;
                    }
                }

                if (!ignore) {
                    setError("Failed to load repositories");
                    setLoading(false);
                }
            } catch (e) {
                if (!ignore) {
                    setError("Failed to load repositories");
                    setLoading(false);
                }
            }
        }
        fetchRepos();
        return () => {
            ignore = true;
        };
    }, [githubId, accessToken]);

    // Split into Owned vs Adopted using available hints
    const owned = useMemo(() => {
        const username = user?.username;
        return repos.filter((r) => {
            if (r?.owner?.id && user?.githubId) return r.owner.id === user.githubId;
            if (typeof r.fullName === "string" && username) return r.fullName.startsWith(`${username}/`);
            return true; // if unknown, consider owned
        });
    }, [repos, user]);

    const adopted = useMemo(() => {
        const username = user?.username;
        return repos.filter((r) => {
            if (r?.owner?.id && user?.githubId) return r.owner.id !== user.githubId;
            if (typeof r.fullName === "string" && username) return !r.fullName.startsWith(`${username}/`);
            return false;
        });
    }, [repos, user]);

    // Simple status/completion heuristics for presentation
    const getStatusAndCompletion = (r) => {
        const updated = new Date(r.updated_at || r.lastUpdated || Date.now());
        const daysSince = (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24);
        const openIssues = r.open_issues_count ?? 0;
        const completed = openIssues === 0 && daysSince > 90;
        const status = completed ? "Completed" : "In Progress";
        let completion = 75;
        if (typeof openIssues === "number") completion = Math.max(20, Math.min(100, 100 - openIssues * 5));
        if (completed) completion = 100;
        return { status, completion };
    };

    return (
        <section className="relative c-space section-spacing">
            <h2 className="text-heading">My Projects</h2>
            <p className="headtext text-neutral-400">
                A consolidated view of repositories you own or have adopted.
            </p>
            <div className="bg-gradient-to-r from-transparent via-neutral-700 to transparent mt-6 h-[1px] w-full" />

            {!user ? (
                <div className="mt-10 text-neutral-300">
                    <p>Please login with GitHub to view your repositories.</p>
                </div>
            ) : loading ? (
                <div className="mt-10 text-neutral-400">Loading repositories…</div>
            ) : error ? (
                <div className="mt-10 text-coral">{error}</div>
            ) : repos.length === 0 ? (
                <div className="mt-10 text-neutral-300">No repositories found.</div>
            ) : (
                <>
                    <div className="mt-10">
                        <div className="flex items-center gap-2 text-xl font-semibold">
                            <img src="/assets/socials/linkedIn.svg" alt="icon" className="w-5 h-5 opacity-70" />
                            Owned Projects
                        </div>
                        <div className="bg-gradient-to-r from-transparent via-neutral-700 to transparent mt-4 h-[1px] w-full" />
                        <div className="mt-6 grid grid-cols-1 gap-6">
                            {owned.map((repo) => {
                                const { status, completion } = getStatusAndCompletion(repo);
                                return (
                                    <RepoCard
                                        key={repo.id || repo.fullName || repo.name}
                                        repo={repo}
                                        status={status}
                                        completion={completion}
                                        accent="bg-royal"
                                    />
                                );
                            })}
                            {owned.length === 0 && (
                                <div className="text-neutral-400 text-sm">No owned projects.</div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12">
                        <div className="flex items-center gap-2 text-xl font-semibold">
                            <img src="/assets/socials/instagram.svg" alt="icon" className="w-5 h-5 opacity-70" />
                            Adopted Projects
                        </div>
                        <div className="bg-gradient-to-r from-transparent via-neutral-700 to transparent mt-4 h-[1px] w-full" />
                        <div className="mt-6 grid grid-cols-1 gap-6">
                            {adopted.map((repo) => {
                                const { status, completion } = getStatusAndCompletion(repo);
                                return (
                                    <RepoCard
                                        key={repo.id || repo.fullName || repo.name}
                                        repo={repo}
                                        status={status}
                                        completion={completion}
                                        accent="bg-mint"
                                    />
                                );
                            })}
                            {adopted.length === 0 && (
                                <div className="text-neutral-400 text-sm">No adopted projects.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
};

export default MyProjects;


