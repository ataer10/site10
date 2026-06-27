/**
 * JSON-LD'yi güvenli şekilde gömer. `<` kaçışı XSS/script kırılmasını önler.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
