/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Rass (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       (c) 2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs

************************************************************************ */

/**
 * TODO
 */
qx.Class.define("qx.fx.effect.combination.Puff",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element)
  {
    this.base(arguments, element);

    this._effects = [
      new qx.fx.effect.core.Scale(this._element),
      new qx.fx.effect.core.FadeOut(this._element)
    ];

    this._mainEffect = new qx.fx.effect.core.Parallel(this._effects);
  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {

    setup : function()
    {
      this.base(arguments);

      this._oldStyle = {
        top    : qx.bom.element.Location.getTop(this._element, "scroll"),
        left   : qx.bom.element.Location.getLeft(this._element, "scroll"),
        width  : qx.bom.element.Dimension.getWidth(this._element),
        height : qx.bom.element.Dimension.getHeight(this._element)
      };
    },

    afterFinishInternal : function()
    {
      for(var property in this._oldStyle) {
        qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
      }
    },


    start : function()
    {
      this.base(arguments);

      this._effects[0].set({
        scaleTo : 200,
        sync : true,
        scaleFromCenter : true,
        scaleContent : true,
        restoreAfterFinish : true
      });

      this._effects[1].set({
        sync: true,
        to: 0.0
      });

      this._mainEffect.start();
    }

   },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {

  }
});
