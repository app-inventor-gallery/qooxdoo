/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * Base2
     http://code.google.com/p/base2/
     Version 0.9

     Copyright:
       (c) 2006-2007, Dean Edwards

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Dean Edwards

************************************************************************ */


/**
 * CSS class name support for HTML elements. Supports multiple class names
 * for each element. Can query and apply class names to HTML elements.
 */
qx.Class.define("qx.bom.element.Class",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {RegExp} Regular expressions to split class names */
    __splitter : /\s+/g,
  
    /** {RegExp} String trim regular expression. */
    __trim : /^\s+|\s+$/g,  
  
    /**
     * Adds a className to the given element
     * If successfully added the given className will be returned
     *
     * @signature function(elem, name)
     * @param element {Element} The element to modify
     * @param name {String} The class name to add
     * @return {String} The added classname (if so)
     */
    add : qx.lang.Object.select(qx.bom.client.Feature.HTML5_CLASSLIST ? "native" : "default",
    {
      "native" : function(elem, name)
      {
        elem.classList.add(name)
        return name;
      },
        
      "default" : function(element, name)
      {
        if (!this.has(element, name)) {
          element.className += (element.className ? " " : "") + name;
        }
  
        return name;
      }
    }),


    /**
     * Adds multiple classes to the given element
     * 
     * @signature function(elem, classes)
     * @param elem {Element} DOM element to modify
     * @param classes {String[]} List of classes to add.
     * @return {String} The resulting class name which was applied
     */
    addClasses : qx.lang.Object.select(qx.bom.client.Feature.HTML5_CLASSLIST ? "native" : "default",
    {
      "native" : function(elem, classes)
      {
        for (var i=0; i<classes.length; i++) {
          elem.classList.add(classes[i])
        }
        return elem.className;
      },
        
      "default" : function(elem, classes)
      {
        var keys = {};
        var result;
       
        var old = elem.className;
        if (old)
        {
          result = old.split(this.__splitter);
          for (var i=0, l=result.length; i<l; i++) {
            keys[result[i]] = true;
          }
  
          for (var i=0, l=classes.length; i<l; i++) 
          {
            if (!keys[classes[i]]) {
              result.push(classes[i]);
            }
          }
        }
        else {
          result = classes;
        }    
  
        return elem.className = result.join(" ");
      }
    }),


    /**
     * Gets the classname of the given element
     *
     * @param element {Element} The element to query
     * @return {String} The retrieved classname
     */
    get : function(element) {
      return element.className;
    },


    /**
     * Whether the given element has the given className.
     *
     * @signature function(element, name)
     * @param element {Element} The DOM element to check
     * @param name {String} The class name to check for
     * @return {Boolean} true when the element has the given classname
     */
    has : qx.lang.Object.select(qx.bom.client.Feature.HTML5_CLASSLIST ? "native" : "default",
    {
      "native" : function(element, name) {
        return element.classList.contains(name);
      },
    
      "default" : function(element, name)
      {
        var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
        return regexp.test(element.className);
      }
    }),


    /**
     * Removes a className from the given element
     *
     * @signature function(element, name)
     * @param element {Element} The DOM element to modify
     * @param name {String} The class name to remove
     * @return {String} The removed class name
     */
    remove : qx.lang.Object.select(qx.bom.client.Feature.HTML5_CLASSLIST ? "native" : "default",
    {
      "native" : function(element, name) 
      {
        element.classList.remove(name);
        return name;
      },
    
      "default" : function(element, name)
      {
        var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
        element.className = element.className.replace(regexp, "$2");
  
        return name;
      }
    }),
    
    
    /**
     * Removes multiple classes from the given element
     * 
     * @signature function(elem, classes)
     * @param elem {Element} DOM element to modify
     * @param classes {String[]} List of classes to remove.
     * @return {String} The resulting class name which was applied
     */    
    removeClasses : qx.lang.Object.select(qx.bom.client.Feature.HTML5_CLASSLIST ? "native" : "default",
    {
      "native" : function(elem, classes) 
      {
        for (var i=0; i<classes.length; i++) {
          elem.classList.remove(classes[i])
        }
        return elem.className;
      },
    
      "default" : function(elem, classes)
      {
        var reg = new RegExp("\\b" + classes.join("\\b|\\b") + "\\b", "g");
        return elem.className = elem.className.replace(reg, "").replace(this.__trim, "").replace(this.__splitter, " ");
      }
    }),


    /**
     * Replaces the first given class name with the second one
     *
     * @param element {Element} The DOM element to modify
     * @param oldName {String} The class name to remove
     * @param newName {String} The class name to add
     * @return {String} The added class name
     */
    replace : function(element, oldName, newName)
    {
      this.remove(element, oldName);
      return this.add(element, newName);
    },


    /**
     * Toggles a className of the given element
     *
     * @signature function(element, name) 
     * @param element {Element} The DOM element to modify
     * @param name {String} The class name to toggle
     * @param toggle {Boolean?null} Whether to switch class on/off. Without
     *    the parameter an automatic toggling would happen.
     * @return {String} The class name
     */
    toggle : qx.lang.Object.select(qx.bom.client.Feature.HTML5_CLASSLIST ? "native" : "default",
    {
      "native" : function(element, name) 
      {
        element.classList.toggle(name);
        return name;
      },
    
      "default" : function(element, name, toggle)
      {
        if (toggle == null) {
          toggle = !this.has(element, name);
        }
  
        toggle ? this.add(element, name) : this.remove(element, name);
        return name;
      }
    })
  }
});
