'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Story</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Hey! I'm the person behind SneakyGuy. I work as a Data Scientist during the week, but weekends are when I truly come alive - that's when I code and build stuff just for fun.
          </p>

          <p className="text-gray-600 mb-6">
            It all started with some side projects. I built RapidShorts to convert long YouTube videos into short clips you can share anywhere. Then I made Pixel Recovery Center to restore old photos and videos from the 90s. I loved building these things! I'd code late into the night until I had something that worked.
          </p>

          <p className="text-gray-600 mb-6">
            But then came the hard part - finding users. Man, marketing is TOUGH when you're just a developer with a product. I had zero clue how to get my stuff in front of people who'd actually use it. My projects just sat there, hidden in some forgotten corner of the internet.
          </p>

          <p className="text-gray-600 mb-6">
            I bet a lot of you makers know exactly what I'm talking about. You build something cool but nobody sees it. Frustrating, right?
          </p>

          <p className="text-gray-600 mb-6">
            I stumbled onto something while browsing Reddit one day. People were literally asking for solutions that my products could solve! But how was I supposed to find all these conversations? I checked out some tools but they either didn't do what I needed or wanted to charge me an arm and a leg.
          </p>

          <p className="text-gray-600 mb-6">
            So I did what any programmer would do - I built my own solution. I created this simple tool to scan Reddit for keywords about my products and ping me when there was a relevant discussion.
          </p>

          <p className="text-gray-600 mb-6">
            I decided to use this new tool (which would later become SneakyGuy) to try marketing itself - pretty meta, right? And guess what? It actually got me my first paying customer! That feeling when someone values your creation enough to pay for it... nothing beats that confidence boost.
          </p>

          <p className="text-gray-600 mb-6">
            That's when I knew I wasn't just solving my own problem - other people needed this too.
          </p>

          <p className="text-gray-600 mb-6">
            What makes me really proud isn't that I built another SaaS tool. It's that every feature in SneakyGuy came from a real headache I personally experienced. This is the tool I wish I had when I first launched my weekend projects.
          </p>

          <p className="text-gray-600 mb-6">
            If you're building something cool on the side like I was, or if you're running a company and need to find real people who actually need what you're selling, SneakyGuy was built by someone who gets it.
          </p>

          <p className="text-gray-600 mb-6">
            I'd love for you to try it out. And hey, drop me a line with feedback - SneakyGuy keeps getting better because of people like you telling me what they need.
          </p>

          <p className="text-gray-600 mb-6 font-medium">
            Let's find those conversations together!
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: February 13, 2025
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
