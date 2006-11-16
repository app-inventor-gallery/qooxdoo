/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_popup)
#optional(qx.manager.object.MenuManager)

************************************************************************ */

qx.OO.defineClass("qx.ui.popup.Popup", qx.ui.layout.CanvasLayout,
function()
{
  qx.ui.layout.CanvasLayout.call(this);

  this.setZIndex(this._minZIndex);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "popup" });

/*!
  Whether to let the system decide when to hide the popup. Setting
  this to false gives you better control but it also requires you
  to handle the closing of the popup.
*/
qx.OO.addProperty({ name : "autoHide", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  Make element displayed (if switched to true the widget will be created, if needed, too).
  Instead of qx.ui.core.Widget, the default is false here.
*/
qx.OO.changeProperty({ name : "display", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Center the popup on open
*/
qx.OO.addProperty({ name : "centered", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/**
 * Whether the popup should be restricted to the visible area of the page when opened.
 */
qx.OO.addProperty({ name : "restrictToPageOnOpen", type : qx.constant.Type.BOOLEAN, defaultValue : true });


qx.Proto._showTimeStamp = (new Date(0)).valueOf();
qx.Proto._hideTimeStamp = (new Date(0)).valueOf();


/**
 * The minimum offset to the left of the page too keep when
 * {@link #restrictToPageOnOpen} is true (in pixels).
 */
qx.Settings.setDefault("restrictToPageLeft", "5");

/**
 * The minimum offset to the right of the page too keep when
 * {@link #restrictToPageOnOpen} is true (in pixels).
 */
qx.Settings.setDefault("restrictToPageRight", "5");

/**
 * The minimum offset to the top of the page too keep when
 * {@link #restrictToPageOnOpen} is true (in pixels).
 */
qx.Settings.setDefault("restrictToPageTop", "5");

/**
 * The minimum offset to the bottom of the page too keep when
 * {@link #restrictToPageOnOpen} is true (in pixels).
 */
qx.Settings.setDefault("restrictToPageBottom", "5");





/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

qx.Proto._beforeAppear = function()
{
  qx.ui.layout.CanvasLayout.prototype._beforeAppear.call(this);

  qx.manager.object.PopupManager.getInstance().add(this);
  qx.manager.object.PopupManager.getInstance().update(this);

  this._showTimeStamp = (new Date).valueOf();
  this.bringToFront();
}

qx.Proto._beforeDisappear = function()
{
  qx.ui.layout.CanvasLayout.prototype._beforeDisappear.call(this);

  qx.manager.object.PopupManager.getInstance().remove(this);

  this._hideTimeStamp = (new Date).valueOf();
}

qx.Proto._afterAppear = function() {
  qx.ui.layout.CanvasLayout.prototype._afterAppear.call(this);

  if (this.getRestrictToPageOnOpen()) {
    var doc = qx.ui.core.ClientDocument.getInstance();
    var docWidth = doc.getClientWidth();
    var docHeight = doc.getClientHeight();
    var restrictToPageLeft   = parseInt(qx.Settings.getValueOfClass("qx.ui.popup.Popup", "restrictToPageLeft"));
    var restrictToPageRight  = parseInt(qx.Settings.getValueOfClass("qx.ui.popup.Popup", "restrictToPageRight"));
    var restrictToPageTop    = parseInt(qx.Settings.getValueOfClass("qx.ui.popup.Popup", "restrictToPageTop"));
    var restrictToPageBottom = parseInt(qx.Settings.getValueOfClass("qx.ui.popup.Popup", "restrictToPageBottom"));
    var left   = this.getLeft();
    var top    = this.getTop();
    var width  = this.getBoxWidth();
    var height = this.getBoxHeight();

    var oldLeft = left;
    var oldTop = top;

    // NOTE: We check right and bottom first, because top and left should have
    //       priority, when both sides are violated.
    if (left + width > docWidth - restrictToPageRight) {
      left = docWidth - restrictToPageRight - width;
    }
    if (top + height > docHeight - restrictToPageBottom) {
      top = docHeight - restrictToPageBottom - height;
    }
    if (left < restrictToPageLeft) {
      left = restrictToPageLeft;
    }
    if (top < restrictToPageTop) {
      top = restrictToPageTop;
    }

    if (left != oldLeft || top != oldTop) {
      var self = this;
      self.getElement().style.visibility = "hidden";
      window.setTimeout(function() {
        self.getElement().style.visibility = "";
        self.setLeft(left);
        self.setTop(top);
        qx.ui.core.Widget.flushGlobalQueues();
      }, 0);
    }
  }
};





/*
---------------------------------------------------------------------------
  ACTIVE/INACTIVE
---------------------------------------------------------------------------
*/

qx.Proto._makeActive = function() {
  this.getFocusRoot().setActiveChild(this);
}

qx.Proto._makeInactive = function()
{
  var vRoot = this.getFocusRoot();
  var vCurrent = vRoot.getActiveChild();

  if (vCurrent == this) {
    vRoot.setActiveChild(vRoot);
  }
}





/*
---------------------------------------------------------------------------
  FOCUS
---------------------------------------------------------------------------
*/

qx.Proto.isFocusable = function() {
  return false;
}





/*
---------------------------------------------------------------------------
  ZIndex Positioning
---------------------------------------------------------------------------
*/

qx.Proto._minZIndex = 1e6;

qx.Proto.bringToFront = function()
{
  this.forceZIndex(Infinity);
  this._sendTo();
}

qx.Proto.sendToBack = function()
{
  this.forceZIndex(-Infinity);
  this._sendTo();
}

qx.Proto._sendTo = function()
{
  var vPopups = qx.lang.Object.getValues(qx.manager.object.PopupManager.getInstance().getAll());
  var vMenus = qx.lang.Object.getValues(qx.manager.object.MenuManager.getInstance().getAll());

  var vAll = vPopups.concat(vMenus).sort(qx.util.Compare.byZIndex);
  var vLength = vAll.length;
  var vIndex = this._minZIndex;

  for (var i=0; i<vLength; i++) {
    vAll[i].setZIndex(vIndex++);
  }
}






/*
---------------------------------------------------------------------------
  TIMESTAMP HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.getShowTimeStamp = function() {
  return this._showTimeStamp;
}

qx.Proto.getHideTimeStamp = function() {
  return this._hideTimeStamp;
}

/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

/**
 * Positions the popup relative to some reference element.
 * @param el    {var} Reference DOM element/widget.
 * @param offsetX   {int} Offset in pixels in X direction (optional).
 * @param offsetY   {int} Offset in pixels in Y direction (optional).
 */
qx.Proto.positionRelativeTo = function(el, offsetX, offsetY)
{
  if (el instanceof qx.ui.core.Widget) {
    el = el.getElement();
  }
  if (el) {
    var gecko = qx.sys.Client.getInstance().isGecko();
    var loc = qx.dom.DomLocation;
    this.setLocation(loc.getClientAreaLeft(el) - (gecko ? qx.dom.DomStyle.getBorderLeft(el):0) + (offsetX || 0),
      loc.getClientAreaTop(el) - (gecko ? qx.dom.DomStyle.getBorderTop(el):0) + (offsetY || 0));
  } else {
    this.warn('Missing reference element');
  }
}

qx.Proto.centerToBrowser = function()
{
  var d = qx.ui.core.ClientDocument.getInstance();

  var left = (d.getClientWidth() - this.getBoxWidth()) / 2;
  var top = (d.getClientHeight() - this.getBoxHeight()) / 2;

  this.setLeft(left < 0 ? 0 : left);
  this.setTop(top < 0 ? 0 : top);
}



/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  this._showTimeStamp = null;
  this._hideTimeStamp = null;

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
}
