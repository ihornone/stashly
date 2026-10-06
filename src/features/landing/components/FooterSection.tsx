import { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Footer, FooterBottom, FooterColumn, FooterContent } from '@/components/ui/footer'
import BrandLogo from '@/components/ui/brand-logo'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

interface FooterLink {
  text: string
  href: string
}

interface FooterColumnProps {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  logo?: ReactNode
  name?: string
  columns?: FooterColumnProps[]
  copyright?: string
  policies?: FooterLink[]
  className?: string
}

export default function FooterSection({
  columns = [
    {
      title: 'Продукт',
      links: [
        { text: 'Документація', href: '/docs/getting-started/introduction' },
      ],
    },
    {
      title: 'Спільнота',
      links: [
        { text: 'GitHub', href: siteMetadata.github },
      ],
    },
  ],
  copyright = `© ${new Date().getFullYear()} Всі права захищено`,
  policies = [
    { text: 'Конфіденційність', href: '/privacy' },
    { text: 'Умови використання', href: '/terms' },
  ],
  className,
}: FooterProps) {
  return (
    <footer className={cn('bg-background w-full px-4', className)}>
      <div className="max-w-container mx-auto">
        <Footer className="mb-10">
          <FooterContent>
            <FooterColumn className="col-span-1 space-y-3 md:col-span-2">
              <BrandLogo />
              <div className="text-muted-foreground space-y-2 text-sm">Зберігайте. Структуруйте. Володійте.</div>

              <div className="flex items-center gap-3 pt-2">
                {siteMetadata.github && <SocialIcon kind="github" href={siteMetadata.github} size={5} />}
              </div>
            </FooterColumn>
            {columns.map((column, index) => (
              <FooterColumn key={index}>
                <h3 className="text-md pt-1 font-semibold">{column.title}</h3>
                {column.links.map((link, linkIndex) => (
                  <a key={linkIndex} href={link.href} className="text-muted-foreground text-sm">
                    {link.text}
                  </a>
                ))}
              </FooterColumn>
            ))}
          </FooterContent>
          <FooterBottom>
            <div>{copyright}</div>
            <div className="flex items-center gap-4">
              {policies.map((policy, index) => (
                <a key={index} href={policy.href}>
                  {policy.text}
                </a>
              ))}
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  )
}
