import{j as t}from"./index-CpYBT7P0.js";const H=({title:s,subtitle:l,description:x,titleClassName:n="",subtitleClassName:m="",descriptionClassName:r="",containerClassName:c="",align:d="center",spacing:o="normal",size:p="default",showUnderline:C=!1,underlineClassName:j="",children:a,...g})=>{const i={small:{title:"text-lg md:text-xl lg:text-2xl",subtitle:"text-sm md:text-base",description:"text-sm md:text-base",container:"py-4 md:py-6"},default:{title:"text-xl md:text-2xl lg:text-3xl",subtitle:"text-base md:text-lg",description:"text-base md:text-lg !mt-1",container:"pb-2 md:pb-4"},large:{title:"text-2xl md:text-3xl lg:text-4xl",subtitle:"text-lg md:text-xl",description:"text-lg md:text-xl",container:"py-8 md:py-10"},xl:{title:"text-3xl md:text-4xl lg:text-5xl",subtitle:"text-xl md:text-2xl",description:"text-xl md:text-2xl",container:"py-10 md:py-12"}},b={left:"text-left",center:"text-center",right:"text-right"},u={tight:"space-y-2",normal:"space-y-3 md:space-y-4",loose:"space-y-4 md:space-y-6"},e=i[p]||i.default,y=`
    ${e.container}
    ${b[d]}
    ${u[o]}
    ${c}
  `.trim(),f=`
    font-semibold text-brand
    ${e.title}
    ${n}
  `.trim(),$=`
    font-semibold text-smallHeader uppercase tracking-wide
    ${e.subtitle}
    ${m}
  `.trim(),h=`
    text-gray-600 font-normal
    ${e.description}
    ${r}
  `.trim();return t.jsxs("div",{className:y,...g,children:[s&&t.jsx("h3",{className:f,children:s}),l&&t.jsx("h3",{className:$,children:l}),x&&t.jsx("p",{className:h,children:x}),a&&t.jsx("div",{className:"mt-2",children:a})]})};export{H};
