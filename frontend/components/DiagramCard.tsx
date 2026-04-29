import Image from 'next/image'

interface Props {
  url: string
}

export default function DiagramCard({ url }: Props) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 inline-block">
      <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Diagram</p>
      <Image
        src={url}
        alt="Venn diagram"
        width={480}
        height={320}
        className="rounded-lg max-w-full"
        unoptimized
      />
    </div>
  )
}
