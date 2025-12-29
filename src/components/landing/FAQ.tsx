import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How accurate is the AI detection?',
    answer: 'Our AI detection uses advanced language models to analyze text patterns, achieving high accuracy rates. We analyze sentence structure, vocabulary usage, and statistical patterns that distinguish AI-generated content from human writing.',
  },
  {
    question: 'Will humanized text pass AI detectors?',
    answer: 'Our humanization process is designed to significantly reduce AI detection scores by introducing natural language patterns, varied sentence structures, and human-like imperfections. While no tool can guarantee 100% undetectability, our users consistently see major improvements.',
  },
  {
    question: 'How do credits work?',
    answer: 'Credits are used for both detection and humanization. Detection costs 1 credit per analysis, while humanization costs 2-5 credits depending on text length. You get 100 free credits on signup, and Pro plans include monthly credit allowances.',
  },
  {
    question: 'Is my content stored securely?',
    answer: 'Yes, all content is encrypted and stored securely. We never share your content with third parties. You can delete your documents at any time from your dashboard.',
  },
  {
    question: 'Can I use this for academic work?',
    answer: 'Our tool is designed for legitimate content transformation purposes. We encourage users to follow their institution\'s guidelines regarding AI-assisted writing. The tool works great for improving drafts and making content more engaging.',
  },
  {
    question: 'What types of content work best?',
    answer: 'HumanizeAI Pro works well with essays, articles, blog posts, emails, reports, and general prose. It\'s optimized for English content and handles both short and long-form text effectively.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="container px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about HumanizeAI Pro.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
