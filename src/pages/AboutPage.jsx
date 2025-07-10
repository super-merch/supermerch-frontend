import React from 'react'
import Feature from '../components/about/Feature'
import MetricSec from '../components/about/MetricSec'
import Stable from '../components/about/Stable'
import TeamMember from '../components/about/TeamMember'
import Brands from '../components/Home/Brands'
import Blog from '../components/about/Blog'
import ABoutHero from '../components/about/ABoutHero'
import Version from '../components/about/Version'
import NavigateAbout from '../components/about/NavigateAbout'

const AboutPage = () => {
  return (
    <div>
      <NavigateAbout/>
          <ABoutHero/>
          <TeamMember/>
          <Feature />
          <MetricSec/>
          <Stable />
          <Version/>
          <div className='mt-8'>
          <Brands />
          </div>
          <Blog/>
    </div>
  )
}

export default AboutPage