import { useEffect } from 'react'
import { Routes, Route } from 'react-router'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FlavorProvider } from '@/theme/useFlavorTheme'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Products from '@/pages/Products'
import Blog from '@/pages/Blog'
import Contact from '@/pages/Contact'

gsap.registerPlugin(ScrollTrigger)

function useLenis() {
  useEffect(() => {
    // prefers-reduced-motion guard
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      syncTouch: true, // lenis ≥1.3 renamed smoothTouch → syncTouch
    })

    // Lenis ↔ ScrollTrigger cooperation: drive Lenis from
    // GSAP's ticker so scroll updates and trigger updates share one clock.
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}

export default function App() {
  useLenis()

  return (
    <FlavorProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />} />
          <Route path="blog" element={<Blog />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </FlavorProvider>
  )
}
