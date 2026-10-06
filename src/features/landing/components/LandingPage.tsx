'use client'

import React from 'react'
import Navbar from './NavbarSection'
import Hero from './HeroSection'
import AppFeatures from './AppFeaturesSection'
import Items from './ItemsSection'
import Faq from './FaqSection'
import ClosingCta from './CtaClosingSection'
import Footer from './FooterSection'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <AppFeatures />
        <Items />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  )
}
