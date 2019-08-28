(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('ChineseDistricts', [], factory)
    } else {
        factory()
    }
})(function () {
    var ChineseDistricts = {
        0: {
           //1: '马克思主义学院',
            1: '政法学院',
            2: '教育学院',
            3: '文学与新闻传播学院',
            4: '外国语学院',
            5: '历史文化与旅游学院',
            6: '经济管理学院',
            7: '音乐学院',
            8: '美术学院',
            9: '数学与信息科学学院',
            10: '物理与光电技术学院',
            11: '化学化工学院',
            12: '地理与环境学院',
            13: '机械工程学院',
            14: '电子电气学院',
            15: '计算机学院',
            16: '体育学院'
        },
        1: {
            100: '思想政治教育',
            101: '公共事业管理',
            102: '法学',
            103: '行政管理',
            104:'哲学'
        },
        2: {
            200: '教育学',
            201: '学前教育',
            202: '教育技术学',
            203: '应用心理学'
        },
        3: {
            300: '汉语言文学',
            301: '广告学',
            302: '播音与主持艺术',
            303: '广播电视编导'
        },
        4: {
            400: '英语',
            401: '翻译'
        },
        5: {
            500: '历史学',
            501: '旅游管理',
            502: '文化产业管理'
        },
        6: {
            600: '工商管理类',
            601: '工商管理',
            602: '人力资源管理',
            603: '市场营销',
            604:'会计学',
            605:'经济学'
        },
        7: {
            700: '音乐学',
            701: '舞蹈学'
        },
        8: {
            800: '美术学',
            801: '设计学类',
            802: '视觉传达设计',
            803: '环境设计',
            804:'服装与服饰设计'
        },
        9: {
            900: '数学与应用数学',
            901: '信息与计算科学',
            902: '统计学'
        },
        10: {
            1000: '物理学',
            1001: '电子科学与技术',
            1002: '测控技术与仪器',
            1003: '材料物理'
        },
        11: {
            1100: '化学',
            1101: '应用化学',
            1102: '化学工程与工艺',
            1103: '制药工程',
            1104:'材料化学'
        },
        12: {
            1200: '地理科学',
            1201: '人文地理与城乡规划',
            1202: '自然地理与资源环境',
            1203: '环境工程',
            1204:'给排水科学与工程',
            1205:'测绘工程'
        },
        13: {
            1300: '机械设计制造及其自动化',
            1301: '材料成型及控制工程',
            1302: '机械电子工程',
            1303: '工业设计'
        },
        14: {
            1400: '电气工程及其自动化',
            1401: '电子信息类',
            1402: '电子信息工程',
            1403: '通信工程',
            1404:'自动化类',
            1405:'自动化',
            1406:'轨道交通信号与控制'
        },
        15: {
            1500: '计算机科学与技术',
            1501: '软件工程',
            1502: '物联网工程'
        },
        16: {
            1600: '体育教育'
            },
    };
    if (typeof window !== 'undefined') {
        window.ChineseDistricts = ChineseDistricts
    }
    return ChineseDistricts
});
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery', 'ChineseDistricts'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('jquery'), require('ChineseDistricts'));
    } else {
        // Browser globals.
        factory(jQuery, ChineseDistricts);
    }
})(function ($, ChineseDistricts) {

    'use strict';

    if (typeof ChineseDistricts === 'undefined') {
        throw new Error('The file "distpicker.data.js" must be included first!');
    }

    var NAMESPACE = 'distpicker';
    var EVENT_CHANGE = 'change.' + NAMESPACE;
    var PROVINCE = 'province';
    var CIRY = 'city';
    var DISTRICT = 'district';

    function Distpicker(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Distpicker.DEFAULTS, $.isPlainObject(options) && options);
        this.placeholders = $.extend({}, Distpicker.DEFAULTS);
        this.active = false;
        this.init();
    }

    Distpicker.prototype = {
        constructor: Distpicker,

        init: function () {
            var options = this.options;
            var $select = this.$element.find('select');
            var length = $select.length;
            var data = {};

            $select.each(function () {
                $.extend(data, $(this).data());
            });

            $.each([PROVINCE, CIRY, DISTRICT], $.proxy(function (i, type) {
                if (data[type]) {
                    options[type] = data[type];
                    this['$' + type] = $select.filter('[data-' + type + ']');
                } else {
                    this['$' + type] = length > i ? $select.eq(i) : null;
                }
            }, this));

            this.bind();

            // Reset all the selects (after event binding)
            this.reset();

            this.active = true;
        },

        bind: function () {
            if (this.$province) {
                this.$province.on(EVENT_CHANGE, (this._changeProvince = $.proxy(function () {
                    this.output(CIRY);
                    this.output(DISTRICT);
                }, this)));
            }

            if (this.$city) {
                this.$city.on(EVENT_CHANGE, (this._changeCity = $.proxy(function () {
                    this.output(DISTRICT);
                }, this)));
            }
        },

        unbind: function () {
            if (this.$province) {
                this.$province.off(EVENT_CHANGE, this._changeProvince);
            }

            if (this.$city) {
                this.$city.off(EVENT_CHANGE, this._changeCity);
            }
        },

        output: function (type) {
            var options = this.options;
            var placeholders = this.placeholders;
            var $select = this['$' + type];
            var districts = {};
            var data = [];
            var code;
            var matched;
            var value;

            if (!$select || !$select.length) {
                return;
            }

            value = options[type];

            code = (
                type === PROVINCE ? 0 :
                    type === CIRY ? this.$province && this.$province.find(':selected').data('code') :
                        type === DISTRICT ? this.$city && this.$city.find(':selected').data('code') : code
            );

            districts = $.isNumeric(code) ? ChineseDistricts[code] : null;

            if ($.isPlainObject(districts)) {
                $.each(districts, function (code, address) {
                    var selected = address === value;

                    if (selected) {
                        matched = true;
                    }

                    data.push({
                        code: code,
                        address: address,
                        selected: selected
                    });
                });
            }

            if (!matched) {
                if (data.length && (options.autoSelect || options.autoselect)) {
                    data[0].selected = true;
                }

                // Save the unmatched value as a placeholder at the first output
                if (!this.active && value) {
                    placeholders[type] = value;
                }
            }

            // Add placeholder option
            if (options.placeholder) {
                data.unshift({
                    code: '',
                    address: placeholders[type],
                    selected: false
                });
            }

            $select.html(this.getList(data));
        },

        getList: function (data) {
            var list = [];

            $.each(data, function (i, n) {
                list.push(
                    '<option' +
                    ' value="' + (n.address && n.code ? n.address : '') + '"' +
                    ' data-code="' + (n.code || '') + '"' +
                    (n.selected ? '' : '') +//去掉了select by Mr.G
                    '>' +
                    (n.address || '') +
                    '</option>'
                );
            });

            return list.join('');
        },

        reset: function (deep) {
            if (!deep) {
                this.output(PROVINCE);
                this.output(CIRY);
                this.output(DISTRICT);
            } else if (this.$province) {
                this.$province.find(':first').prop('selected', true).trigger(EVENT_CHANGE);
            }
        },

        destroy: function () {
            this.unbind();
            this.$element.removeData(NAMESPACE);
        }
    };

    Distpicker.DEFAULTS = {
        autoSelect: true,
        placeholder: true,
        province: '—— 院系 ——',
        city: '—— 年级 ——',
        district: '—— 专业 ——'
    };

    Distpicker.setDefaults = function (options) {
        $.extend(Distpicker.DEFAULTS, options);
    };

    // Save the other distpicker
    Distpicker.other = $.fn.distpicker;

    // Register as jQuery plugin
    $.fn.distpicker = function (option) {
        var args = [].slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this);
            var data = $this.data(NAMESPACE);
            var options;
            var fn;

            if (!data) {
                if (/destroy/.test(option)) {
                    return;
                }

                options = $.extend({}, $this.data(), $.isPlainObject(option) && option);
                $this.data(NAMESPACE, (data = new Distpicker(this, options)));
            }

            if (typeof option === 'string' && $.isFunction(fn = data[option])) {
                fn.apply(data, args);
            }
        });
    };

    $.fn.distpicker.Constructor = Distpicker;
    $.fn.distpicker.setDefaults = Distpicker.setDefaults;

    // No conflict
    $.fn.distpicker.noConflict = function () {
        $.fn.distpicker = Distpicker.other;
        return this;
    };

    $(function () {
        $('[data-toggle="distpicker"]').distpicker();
    });
});