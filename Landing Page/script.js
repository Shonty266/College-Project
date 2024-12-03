function homePageAnimation(){
    gsap.set(".slidesm", {scale: 5})

var tl = gsap.timeline({
    scrollTrigger:{
        trigger: ".home",
        start: "top top",
        end: "bottom top",
        pin: true,
        scrub: 2
    }
})

tl
.to(".vdodiv", {
    '--clip': "0%",
    ease: Power2
}, 'a')
.to(".slidesm", {
    scale: 1,
    ease: Power2
}, 'a')

.to(".lft", {
    xPercent: -10,
    stagger: .04,
    ease: Power4
}, 'b')
.to(".rgt", {
    xPercent: -10,
    stagger: .04,
    ease: Power4
}, 'b')

document.getElementById("btn1").addEventListener("click", function(){
    window.location.href = "http://localhost:5173/Login";
});
}

function rightScrollAnimation(){
   gsap.to(".slide", {
        scrollTrigger: {
            trigger: ".working",
            start: "top top",
            end: "bottom top",
            pin: true,
            scrub: 1
        },
        xPercent: -300,
        ease: Power4
   })
}

function serviceAnimation(){
    const btn1 = document.querySelector(".btn1");
const hiddenPara1 = document.querySelector(".hiddenpara1");
const box1 = document.querySelector(".box1");

btn1.addEventListener("click", function() {
    hiddenPara1.classList.toggle("hidden");
    btn1.classList.toggle("more"); 
    if (btn1.classList.contains("more")) {
        btn1.textContent = "See less"; 
    } else {
        btn1.textContent = "See more"; 
    }
});

const btn2 = document.querySelector(".btn2");
const hiddenPara2 = document.querySelector(".hiddenpara2");
const box2 = document.querySelector(".box2");


btn2.addEventListener("click", function() {
    hiddenPara2.classList.toggle("hidden");
    btn2.classList.toggle("more");
    if (btn2.classList.contains("more")) {
        btn2.textContent = "See less"; 
    } else {
        btn2.textContent = "See more"; 
    }
});

const btn3 = document.querySelector(".btn3");
const hiddenPara3 = document.querySelector(".hiddenpara3");
const box3 = document.querySelector(".box3");



btn3.addEventListener("click", function() {
    hiddenPara3.classList.toggle("hidden");
    btn3.classList.toggle("more");
    if (btn3.classList.contains("more")) {
        btn3.textContent = "See less"; 
    } else {
        btn3.textContent = "See more";
    }
});
}

function aboutAnimation(){
    const abtBtn = document.querySelector(".abt-btn");
const abtHidden = document.querySelector(".abt-hiddenpara");

abtBtn.addEventListener("click", function() {
    abtHidden.classList.toggle("hidden");
    abtBtn.classList.toggle("more");ss
    if (abtBtn.classList.contains("more")) {
        abtBtn.textContent = "See less";
    } else {
        abtBtn.textContent = "See more";
    }
});
}

document.querySelectorAll(".section")
.forEach(function(e){
    ScrollTrigger.create({
        trigger: e,
        start: "top 20%",
        end: "bottom 20%",
        onEnter: function(){
            document.body.setAttribute("theme", e.dataset.color);
        },
        onEnterBack: function(){
            document.body.setAttribute("theme", e.dataset.color);
        }

    })
})




document.querySelectorAll('a.smooth-scroll').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetElement = document.querySelector(this.getAttribute('href'));
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000; // Duration in milliseconds
      let startTime = null;

      function animateScroll(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1); // Normalize progress (0 to 1)
        const easeProgress = easeInOutQuad(progress);
        window.scrollTo(0, startPosition + distance * easeProgress);
        if (timeElapsed < duration) requestAnimationFrame(animateScroll);
      }

      function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      requestAnimationFrame(animateScroll);
    });
  });



homePageAnimation();
rightScrollAnimation();
serviceAnimation();
aboutAnimation();



// Import GSAP
// import gsap from "gsap";

// Select all service boxes
const serviceBoxes = document.querySelectorAll(".service");

// Animate each service box when it comes into view
serviceBoxes.forEach((box) => {
  gsap.from(box, {
    scrollTrigger: {
      trigger: box,
      start: "top 80%",
       // When the top of the box reaches 80% of the viewport height
      end: "top 50%", // When the bottom of the box reaches the top of the viewport
      scrub: true, // Smooth scrubbing
      // markers: true // Use markers to visualize the start and end points (remove for production)
    },
    opacity: 0, // Start with opacity 0
    y: 50, // Start from 50px down
    duration: 1, // Animation duration
    ease: "power2.out" // Easing function
  });
});

// Animate all service boxes together with stagger effect
gsap.from(".service-box", {
  scrollTrigger: {
    trigger: ".service-box", // The common trigger for all boxes
    start: "top bottom", // When the top of the box reaches the bottom of the viewport
    end: "bottom top", // When the bottom of the box reaches the top of the viewport
    scrub: true, // Smooth scrubbing
    // markers: true // Use markers to visualize the start and end points (remove for production)
  },
  opacity: 0, // Start with opacity 0
  y: 50, // Start from 50px down
  duration: 1, // Animation duration
  stagger: 0.2, // Staggered start for each box
  ease: "power2.out" // Easing function
});

  
  gsap.from("#aboutus", {
    scrollTrigger: {
      trigger: "#aboutus",
      start: "top 60%",
      end: "top 30%",
      scrub: true,
    //   markers: true
    },
    opacity: 0,
    y:50,
    duration: 1,
    ease: "power2.out"
  });
  
  gsap.from("#about-image", {
    scrollTrigger: {
      trigger: "#aboutus",
      start: "top 70%",
      end: "bottom top",
      scrub: true,
    //   markers: true
    },
    opacity: 0,
    scale: 0.9,
    duration: 1,
    ease: "power2.out"
  });
  
  gsap.from("#about-text p", {
    scrollTrigger: {
      trigger: "#aboutus",
      start: "top 60%",
      end: "bottom top",
      scrub: true,
    //   markers: true
    },
    opacity: 0,
    y: 20,
    duration: 1,
    stagger: 0.2,
    ease: "power2.out"
  });
  
  
