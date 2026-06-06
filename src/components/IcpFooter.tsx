export function IcpFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`px-4 py-4 text-center text-xs text-slate-400 ${className}`}>
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-slate-500"
      >
        ICP备案号：皖ICP备2026016512号
      </a>
    </footer>
  );
}
