/**
 * Generate Table of content
 * (c) 2014 Cezary Tomczyk - ctomczyk.pl
 * License: http://www.opensource.org/licenses/mit-license.php
 */

/*global NodeFilter */

(function (global) {
    'use strict';

    var isHeader = /^[h][1-6]{1}$/,
        get_header_nodes,
        headers_filter,
        get_inner_text;

    if (document.createTreeWalker) {
        headers_filter = function headers_filter(node) {
            if (isHeader.test(node.nodeName.toLowerCase())) {
                return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
        };

        get_header_nodes = function get_header_nodes(fromNode) {
            var tree = document.createTreeWalker(fromNode, NodeFilter.SHOW_ELEMENT, headers_filter, false),
                resultHeaderNodes = [];
            while (tree.nextNode()) {
                resultHeaderNodes.push(tree.currentNode);
            }
            return resultHeaderNodes;
        };
    } else {
        // Note: if you do not care about IE < 9 then you can remove this function
        // https://developer.mozilla.org/en-US/docs/Web/API/document.createTreeWalker#Browser_compatibility
        get_header_nodes = function get_header_nodes(fromNode) {
            var resultHeaderNodes = [],
                i,
                len;

            if (isHeader.test(fromNode.nodeName.toLowerCase())) {
                resultHeaderNodes.push(fromNode);
            } else if (fromNode.childNodes.length > 0) {
                for (i = 0, len = fromNode.childNodes.length; i < len; i += 1) {
                    resultHeaderNodes = resultHeaderNodes.concat(get_header_nodes(fromNode.childNodes[i]));
                }
            }
            return resultHeaderNodes;
        };
    }

    function get_random_id() {
        var random_str;
        while (!random_str || document.getElementById(random_str)) {
            random_str = Math.random().toString(36).substring(7);
        }
        return random_str;
    }

    // get_inner_text
    if (typeof document.getElementsByTagName('html')[0].textContent === 'string') {
        get_inner_text = function get_inner_text(node) {
            return node.textContent;
        };
    } else if (document.createTreeWalker) {
        get_inner_text = function get_inner_text(root) {
            var w = document.createTreeWalker(root, 4, null, false), result = '';
            while (w.nextNode()) {
                result += w.currentNode.data;
            }
            return result;
        };
    } else {
        get_inner_text = function get_inner_text(node) {
            var txt = '';

            node = node.firstChild;
            while (node) {
                if (node.nodeType === 3 || node.nodeType === 4) {
                    txt += node.data;
                } else if (node.nodeType === 1) {
                    txt += get_inner_text(node);
                }
                node = node.nextSibling;
            }
            return txt;
        };
    }

    function create_toc(fromNode, insertTo) {
        if (!fromNode && !insertTo) {
            return false;
        }
        var headers = get_header_nodes(fromNode),
            toc_elm = insertTo,
            ul_elm = document.createElement('ul'),
            a_elm,
            header_text,
            li_elm;

        headers.forEach(function (item) {
            header_text = get_inner_text(item);
            li_elm = document.createElement('li');
            a_elm = document.createElement('a');

            if (!item.id) {
                item.id = get_random_id();
            }

            a_elm.setAttribute('role', 'link');
            a_elm.setAttribute('aria-label', header_text);
            a_elm.href = document.location.href + '#' + item.id;
            a_elm.appendChild(document.createTextNode(header_text));
            li_elm.appendChild(a_elm);
            ul_elm.appendChild(li_elm);
        });

        toc_elm.appendChild(ul_elm);
    }

    // Expose to global object
    global.create_toc = create_toc;

}(this));
