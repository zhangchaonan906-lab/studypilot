export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mb-6">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold text-primary">{eyebrow}</p>
      ) : null}
      <h1 className="max-w-4xl text-3xl font-bold tracking-normal text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>
    </section>
  );
}
