/**
* Template Name: FlexStart
* Template URL: https://bootstrapmade.com/flexstart-bootstrap-startup-template/
* Updated: Nov 01 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  // function readFile(input) {
  //   if (input.files && input.files[0]) {
  //     var reader = new FileReader();
  
  //     reader.onload = function(e) {
  //       var htmlPreview =
  //         '<img width="200" src="' + e.target.result + '" />' +
  //         '<p>' + input.files[0].name + '</p>';
  //       var wrapperZone = $(input).parent();
  //       var previewZone = $(input).parent().parent().find('.preview-zone');
  //       var boxZone = $(input).parent().parent().find('.preview-zone').find('.box').find('.box-body');
  
  //       wrapperZone.removeClass('dragover');
  //       previewZone.removeClass('hidden');
  //       boxZone.empty();
  //       boxZone.append(htmlPreview);
  //     };
  
  //     reader.readAsDataURL(input.files[0]);
  //   }
  // }
  
  // function reset(e) {
  //   e.wrap('<form>').closest('form').get(0).reset();
  //   e.unwrap();
  // }
  
  // $(".dropzone").change(function() {
  //   readFile(this);
  // });
  
  // $('.dropzone-wrapper').on('dragover', function(e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   $(this).addClass('dragover');
  // });
  
  // $('.dropzone-wrapper').on('dragleave', function(e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   $(this).removeClass('dragover');
  // });
  
  // $('.remove-preview').on('click', function() {
  //   var boxZone = $(this).parents('.preview-zone').find('.box-body');
  //   var previewZone = $(this).parents('.preview-zone');
  //   var dropzone = $(this).parents('.form-group').find('.dropzone');
  //   boxZone.empty();
  //   previewZone.addClass('hidden');
  //   reset(dropzone);
  // });
//   document.addEventListener("DOMContentLoaded", function() {
//     const imgUpload = document.getElementById('img-upload');
//     const previewZone = document.querySelector('.preview-zone');
//     const imgPreview = previewZone.querySelector('.img-preview');
//     const uploadButton = document.getElementById('upload-button');
//     const resetButton = document.getElementById('reset-button');
//     const colorSample = document.getElementById('color-sample');
//     const dropzoneDesc = document.getElementById('dropzone-desc');
//     const dropzoneWrapper = document.querySelector('.dropzone-wrapper');

//     // Open file selector when dropzone is clicked
//     dropzoneWrapper.addEventListener('click', function() {
//         imgUpload.click(); // Simulate a click on the hidden file input
//     });

//     imgUpload.addEventListener('change', function() {
//         const files = imgUpload.files;
//         if (files.length > 0) {
//             const file = files[0];
//             const reader = new FileReader();

//             reader.onload = function(e) {
//                 previewZone.classList.remove('hidden'); // Show the preview
//                 imgPreview.src = e.target.result; // Set the image source for the preview
//                 dropzoneDesc.style.display = 'none'; // Hide the description text
//             };

//             reader.readAsDataURL(file);
//         }
//     });

//     uploadButton.addEventListener('click', function() {
//       const file = imgUpload.files[0];
//       if (!file || !file.type.startsWith('image/')) {
//           alert('Please select a valid image file.');
//           return;
//       }

//       const formData = new FormData();
//       formData.append('img_logo', file);

//       // Send the file to the Flask backend
//       fetch('/upload', {
//           method: 'POST',
//           body: formData,
//       })
//       .then(response => response.json())
//       .then(data => {
//           // Clear previous colors
//           colorSample.innerHTML = '';

//           // Display the dominant colors returned by the backend
//           data.dominant_colors.forEach((rgb) => {
//               const colorBox = document.createElement('div');
//               colorBox.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`; // Set background color
//               colorBox.style.width = '50px'; // Box width
//               colorBox.style.height = '50px'; // Box height
//               colorBox.style.margin = '5px'; // Margins for spacing
//               colorBox.title = `RGB: (${rgb[0]}, ${rgb[1]}, ${rgb[2]})`; // Tooltip with color info
//               colorSample.appendChild(colorBox); // Append to color sample display
//           });

//           // Optionally display the output image
//           const outputImagePath = data.output_image;
//           const outputImage = new Image();
//           outputImage.src = outputImagePath;
//           document.body.appendChild(outputImage); // Append the image to the body or any specific place
//       })
//       .catch(error => {
//           console.error('Error:', error);
//       });
//   });

//     // Reset button functionality
//     resetButton.addEventListener('click', function() {
//         imgUpload.value = ''; // Clear the file input
//         previewZone.classList.add('hidden'); // Hide the preview zone
//         imgPreview.src = ''; // Clear the preview image
//         dropzoneDesc.style.display = 'block'; // Show the description text again
//         colorSample.innerHTML = ''; // Clear the color samples
//     });
// });


  
})();