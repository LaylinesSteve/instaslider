//
//
//	.__                 __           _________.__  .__    .___            
//	|__| ____   _______/  |______   /   _____/|  | |__| __| _/___________ 
//	|  |/    \ /  ___/\   __\__  \  \_____  \ |  | |  |/ __ |/ __ \_  __ \
//	|  |   |  \\___ \  |  |  / __ \_/ _____  \|  |_|  / /_/ \  ___/|  | \/
//	|__|___|  /____  > |__| (____  /_______  /|____/__\____ |\___  >__|   
//          \/     \/            \/        \/              \/    \/       
//
//	Version 0.1.1 - 15/05/2013.
//	A jQuery Slider plugin that populates with images from instagr.am
//	Created by Chris Till. http://iamchristill.com.
//
//	The MIT License (MIT)
//
//  Copyright (c) 2013 Chris Till
//
//	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal
//	in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//	copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//	THE SOFTWARE.
//
// Polyfill for older browsers
if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        "use strict";

        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function ($, window, document, undefined) {
    "use strict";

    var InstaSlider = {

        init: function (options, container) {

            var self = this;
            self.container = container,
            self.$container = $(container),
            self.current = 0, // Set current to 0 on initialise
            self.imgWidth = self.$container.width(), // img width will be the same as the container
            self.options = $.extend({}, $.fn.instaSlider.options, options),
            self.endpoint = 'https://api.instagram.com/v1/tags/' + this.options.hash + '/media/recent?client_id=' + this.options.clientID;

            this.createSlider(); // Create the slider

            self.sliderUL = self.$container.find('.instaslider-wrapper ul');
        },

        createSlider: function () {
            // create the slider
            this.$container.append('<div class="instaslider-wrapper"><ul></ul></div>');

            this.createNav();
            this.createSlides();
        },

        createNav: function () {
            var self = this;
            // create the navigation for the slider
            var buttonPrev = '<button class="' + this.options.prevClass + '" data-direction="prev">Prev</button>',
                buttonNext = '<button class="' + this.options.nextClass + '" data-direction="next">Next</button>',
                nav = '<div class="instaslider-nav">' + buttonPrev + buttonNext + '</div>';

            // append it to the container
            this.$container.append(nav);

            // when a button is clicked set current
            this.$container.find('button').on('click', function () {
                self.setCurrent($(this).data('direction'));
                self.transition();
            });
        },

        fetch: function () {
            //fetch images from instagram
            return $.ajax({
                url: this.endpoint,
                data: {},
                dataType: 'jsonp',
                type: 'GET'
            });
        },

        createSlides: function () {
            // create the slides
            var self = this,
                container = this.$container,
                sliderUL = container.find('.instaslider-wrapper ul');

            self.fetch().done(function (results) {
                // Limit the amount of results
                results = self.limit(results.data, self.options.limit);
                // loop over results create a slider for each one.
                self.slides = $.map(results, function (obj, i) {
                    var img = '<li><img src="' + results[i].images.standard_resolution.url + '" /></li>';
                    sliderUL.append(img);
                });
            });

            self.fetch().fail(function () {
                sliderUL.remove();
                container.html('<div class="error"><p>Sorry,<br /> Could not fetch images at this time.</p></div>');
            });

        },

        setCurrent: function (direction) {
            // set the current slide and handle direction here
            var self = this;
            var pos = self.current;
            pos += (~~(direction === 'next') || -1);
            self.current = (pos < 0) ? self.options.limit - 1 : pos % self.options.limit;
            return pos;
        },

        transition: function () {
            // handle animation and slide transition here
            var self = this;

            self.sliderUL.stop().animate({
                'margin-left': -(this.current * this.imgWidth)
            }, self.options.duration);
        },

        limit: function (obj, limit) {
            return obj.slice(0, limit);
        }

    };

    $.fn.instaSlider = function (options) {
        return this.each(function () {
            var instaSlider = Object.create(InstaSlider);
            instaSlider.init(options, this);
            $.data(this, 'instaSlider', instaSlider);
        });
    };

    /*----------------------------------------------------------------
		Default Options
	----------------------------------------------------------------*/

    $.fn.instaSlider.options = {

        // Default Options
        clientID: null,
        hash: 'photooftheday',
        prevClass: 'prev',
        nextClass: 'next',
        limit: 5,
        duration: 400
    };

})(jQuery, window, document, undefined);