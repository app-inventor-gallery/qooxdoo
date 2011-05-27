/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Adrian Olaru (adrianolaru)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Web Workers allows us to run JavaScript in parallel on a web page,
 * without blocking the user interface. A 'worker' is just another script
 * file that will be loaded and executed in the background.
 *
 * For more information see:
 * http://www.w3.org/TR/workers
 */
qx.Class.define("qx.bom.WebWorker",
{
  extend : qx.core.Object,


  /**
   * Create a new instance.
   *
   * @param src {String} The path to worker as an URL
   */
  construct: function(src)
  {
    this.base(arguments);

    this.__isNative = qx.core.Environment.get("html.webworker");

    if (this.__isNative) {
      this.__initNative(src);
    } else {
      this.__initFake(src);
    }
  },


  events :
  {
    /** Fired when worker sends a message */
    "message": "qx.event.type.Data",

    /** Fired when an error occurs */
    "error": "qx.event.type.Data"
  },


  members :
  {
    _isNative : true,
    _worker : null,
    _handleErrorBound : null,
    _handleMessageBound : null,

    __fake : null,
    __FakeWorker: function(worker, code) {
      var postMessage = this.postMessage = function (e) {
        worker.fireDataEvent("message", e);
      };
      var onmessage;
      eval(code); 
      this.onmessage = onmessage;
    },

    __initNative: function(src) {
      this._worker = new window.Worker(src);
      this._handleMessageBound = qx.lang.Function.bind(this._handleMessage, this);
      this._handleErrorBound = qx.lang.Function.bind(this._handleError, this);

      qx.bom.Event.addNativeListener(this._worker, "message", this._handleMessageBound);
      qx.bom.Event.addNativeListener(this._worker, "error", this._handleErrorBound);
    },

    __initFake: function(src) {
      var that = this;
      var req = new qx.bom.request.Xhr();
      req.onload = function() {
        that.__fake = new that.__FakeWorker(that, req.responseText);
      };  
      req.open("GET", src, false);
      req.send();
    },


    /**
     * Send a message to the worker.
     * @param msg {String} the message
     */
    postMessage: function(msg) {
      var that = this;

      if (this.__isNative) {
        this._worker.postMessage(msg);
      } else {
        window.setTimeout(function() {
          try {
            that.__fake.onmessage.call(that.__fake, {data: msg});
          } catch (ex) {
            that.fireDataEvent("error", ex);
          } 
        }, 0);
      }
    },


    /**
     * Message handler
     * @param e {object} message event
     */
    _handleMessage: function(e) {
      this.fireDataEvent("message", e.data);
    },


    /**
     * Error handler
     * @param e {object} error event
     */
    _handleError: function(e) {
      this.fireDataEvent("error", e.message);
    }
  },


  destruct : function()
  {
    if (this.__isNative) {
      qx.bom.Event.removeNativeListener(this._worker, "message", this._handleMessageBound);
      qx.bom.Event.removeNativeListener(this._worker, "error", this._handleErrorBound);
      if (this._worker)
      {
        this._worker.terminate();
        this._worker = null;
      }
    } else {
      if (this.__fake) {
        this.__fake = null;
      }
    }
  }
});
