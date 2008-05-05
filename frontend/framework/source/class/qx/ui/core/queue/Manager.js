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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class performs the auto flush of all layout relevant queues.
 */
qx.Class.define("qx.ui.core.queue.Manager",
{
  statics :
  {
    /** {Boolean} TODOC */
    __scheduled : false,


    /** {Map} TODOC */
    __jobs : {},


    /**
     * Schedule a deferred flush of all queues.
     *
     * @type static
     * @param job {String} The job, which should be performed. Valid values are
     *     <code>layout</code>, <code>decoration</code> and <code>element</code>.
     * @return {void}
     */
    scheduleFlush : function(job)
    {
      var clazz = qx.ui.core.queue.Manager;

      clazz.__jobs[job] = true;

      if (!clazz.__scheduled)
      {
        clazz.__deferredCall.schedule();
        clazz.__scheduled = true;
      }
    },


    /**
     * Flush all layout queues in the correct order. This function is called
     * deferred if {@link scheduleFlush} is called.
     *
     * @type static
     * @return {void}
     */
    flush : function()
    {
      var self = qx.ui.core.queue.Manager;
      var jobs = self.__jobs;

      while (jobs.widget || jobs.appearance || jobs.decorator || jobs.layout)
      {
        // No else blocks here because each flush can influence the
        // following flushes!
        if (jobs.widget)
        {
          delete jobs.widget;

          var start = new Date;
          qx.ui.core.queue.Widget.flush();

          var time = new Date - start;
          if (time > 3) {
            qx.log.Logger.debug(self, "Widget runtime: " + (time) + "ms");
          }
        }

        if (jobs.appearance)
        {
          delete jobs.appearance;

          var start = new Date;
          qx.ui.core.queue.Appearance.flush();

          var time = new Date - start;
          if (time > 3) {
            qx.log.Logger.debug(self, "Appearance runtime: " + (time) + "ms");
          }
        }

        if (jobs.decorator)
        {
          delete jobs.decorator;

          var start = new Date;
          qx.ui.core.queue.Decorator.flush();

          var time = new Date - start;
          if (time > 3) {
            qx.log.Logger.debug(self, "Decorator runtime: " + (time) + "ms");
          }
        }

        if (jobs.layout)
        {
          delete jobs.layout;

          var start = new Date;
          qx.ui.core.queue.Layout.flush();

          var time = new Date - start;
          if (time > 3) {
            qx.log.Logger.debug(self, "Layout runtime: " + (time) + "ms");
          }
        }
      }

      qx.ui.core.queue.Manager.__scheduled = false;

      if (jobs.element)
      {
        delete jobs.element;

        var start = new Date;
        qx.html.Element.flush();    
            
        var time = new Date - start;
        if (time > 3) {
          qx.log.Logger.debug(self, "Element runtime: " + (time) + "ms");
        }
      }

      if (jobs.dispose)
      {
        delete jobs.dispose;

        var start = new Date;
        qx.ui.core.queue.Dispose.flush();

        var time = new Date - start;
        if (time > 3) {
          qx.log.Logger.debug(self, "Dispose runtime: " + (time) + "ms");
        }
      }

    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  defer : function(statics)
  {
    // Initialize deferred call
    statics.__deferredCall = new qx.util.DeferredCall(statics.flush);

    // Replace default scheduler for HTML element with local one.
    // This is quite a hack, but allows us to force other flushes
    // before the HTML element flush.
    qx.html.Element._scheduleFlush = statics.scheduleFlush;
  }
});
