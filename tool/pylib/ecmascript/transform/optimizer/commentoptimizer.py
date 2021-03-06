#!/usr/bin/env python
# -*- coding: utf-8 -*-
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2011 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

##
# Strip comments from tree
##

from ecmascript.frontend import treeutil
    
def patch(node):
    global cnt
    #for _, commentNode in treeutil.nodeIteratorNonRec(node,["comment", "commentsBefore", "commentsAfter"]):
    for commentNode in treeutil.nodeIterator(node,["comment", "commentsBefore", "commentsAfter"]):
        commentNode.parent.removeChild(commentNode)
