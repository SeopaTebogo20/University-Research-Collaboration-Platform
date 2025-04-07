# University-Research-Collaboration-Platform

## Links of the softwares we will be using:
# Deployed App (Live App)
https://universityresearch-dmbgc8bjhsc0b5gg.canadacentral-01.azurewebsites.net/

# For User Stories >
https://students-team-o21wx7bu.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog

# For Mockups and Prototypes >
https://www.figma.com/design/mhc0wo4Emo4F0UXpRRU9BU/Untitled?t=H5wf1evp1ymt6gXQ-0

# For our Reposetory >
https://github.com/SeopaTebogo20/University-Research-Collaboration-Platform.git

# Before you write any code, PLEASE make sure you do pull request
1. git pull
# If you have already written some code before doing pull request, PLEASE run this command to pull the code without losing the code you wrote
1. git pull --no-rebase

# How to correctly push to a new branch
1. git checkout -b {name of your new branch}
2. (check if you are in the new branch you created by running this command): git branch
2. git add .
3. git commit -m "Your commit message"
4. git push origin {name of your new branch}

## HOW TO RUN THE PROJECT LOCALLY
 ## Run the following commands to install the necessary dependancies and to run the project
 1. npm install
 2. npm install express
 3. node src/server.js


# Welcome Page Documentation

## Overview
The CollabNexus Research Hub welcome page is a modern, responsive landing page designed to introduce researchers to the platform's collaborative features. The page follows a clean, professional design with a color scheme that combines white backgrounds with research-themed accent colors to create a trustworthy, academic aesthetic.

## Page Structure

### 1. Navigation Bar
The navigation bar appears at the top of the page and includes:
- The CollabNexus logo with a book icon
- Main navigation links: Projects, Researchers, Funding, and Resources
- Authentication buttons: Sign In and Register
- A mobile menu button that appears on smaller screens

### 2. Hero Section
The hero section provides an immediate introduction to the platform with:
- A two-column layout on desktop (text left, image right)
- Primary headline: "Connect. Collaborate. Innovate Research."
- Subheadline explaining the platform's purpose
- Call-to-action buttons: "Get Started" and "Learn More"
- A research collaboration image that adds visual context
- Gradient text highlighting for emphasis on key phrases

### 3. Features Section
This section showcases platform capabilities with:
- A section heading: "Powerful Collaboration Tools"
- A descriptive paragraph explaining the platform's approach
- Four feature cards arranged in a grid layout:
  - Project Postings
  - Collaboration Tools
  - Funding Tracking
  - Advanced Reporting
- Each card includes an icon, title, and description
- An "Explore Features" button to encourage deeper exploration

### 4. Statistics Section
This section builds credibility with metrics about platform usage:
- Four key statistics presented in card format:
  - 500+ Research Projects
  - 1,200+ Researchers
  - 150+ Universities
  - $25M+ In Funding
- Each statistic is prominently displayed with explanatory text

### 5. Call-to-Action Section
This section encourages user signup with:
- A gradient background that creates visual emphasis
- A compelling headline: "Ready to Accelerate Your Research?"
- Supportive subtext explaining the value proposition
- Two action buttons: "Create Account" and "Learn More"

### 6. Footer
The footer provides additional navigation and information:
- CollabNexus branding and brief company description
- Social media links
- Four columns of links organized by category:
  - Platform links (Projects, Researchers, etc.)
  - Support resources
  - Company information
  - Legal information
- Copyright notice at the bottom

## Technical Implementation

### Responsive Design
- The landing page uses a mobile-first approach with responsive breakpoints
- Elements reflow appropriately on smaller screens
- The navigation collapses to a mobile menu on smaller viewports

### Animation
- Subtle fade-in animations are applied to content sections as users scroll
- Interactive hover effects on buttons and cards provide visual feedback

### Color Scheme
- Primary colors: Research blue and purple gradient
- Accent color: A vibrant research accent color for buttons and highlights
- Neutral colors: Various shades of white, gray, and dark gray for text and backgrounds

### Typography
- Font families: Inter for body text, Playfair Display for headings
- Text hierarchy is established through size, weight, and color variations

### Component Structure
The page is built with reusable React components:
- `NavBar`: Top navigation with responsive behavior
- `Hero`: Main introductory section
- `Features`: Showcases platform capabilities with `FeatureCard` subcomponents
- Stats section: Displays key metrics in a grid
- CTA section: Final conversion-focused section
- `Footer`: Site-wide navigation and information

## Best Practices
- Semantic HTML is used throughout for accessibility and SEO
- Important UI elements have appropriate hover/focus states
- Images include alt text for accessibility
- Color contrast meets accessibility standards
- Load times are optimized with efficient component rendering

## Future Enhancements
- User testimonials section
- Interactive demo or product tour
- Integration with blog or resources section
- Multilingual support for international researchers
- Dark mode toggle for improved accessibility
