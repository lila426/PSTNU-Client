import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  assign,
} from 'min-dash';
import {
  query as domQuery
} from 'min-dom';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { isAny } from "bpmn-js/lib/features/modeling/util/ModelingUtil";

import {
  componentsToPath,
  createLine
} from 'diagram-js/lib/util/RenderUtil';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses,
  innerSVG, prependTo
} from 'tiny-svg';

import Ids from 'ids';

import { createCurve } from 'svg-curves';

var RENDERER_IDS = new Ids();

var TASK_BORDER_RADIUS = 2;

var DEFAULT_COLOR = 'black',
    COLOR_TRANSPARENT = 'white',
    COLOR_GREEN = '#52B415',
    COLOR_RED = '#cc0000',
    COLOR_YELLOW = '#ffc800';

/**
 * A renderer that knows how to render custom elements.
 */
export default function CustomRenderer(eventBus, styles, customPathMap, bpmnRenderer, textRenderer, canvas) {

  BaseRenderer.call(this, eventBus, 2000);
  this.textRenderer = textRenderer;
  this.bpmnRenderer = bpmnRenderer;

  var computeStyle = styles.computeStyle;
  var rendererId = RENDERER_IDS.next();
  var markers = {};

  function addMarker(id, options) {
      var attrs = assign({
        fill: 'red',
        strokeWidth: 1,
        strokeLinecap: 'round',
        strokeDasharray: 'none'
      }, options.attrs);

      var ref = options.ref || { x: 0, y: 0 };

      var scale = options.scale || 1;

      // fix for safari / chrome / firefox bug not correctly
      // resetting stroke dash array
      if (attrs.strokeDasharray === 'none') {
        attrs.strokeDasharray = [10000, 1];
      }

      var marker = svgCreate('marker');

      svgAttr(options.element, attrs);

      svgAppend(marker, options.element);

      svgAttr(marker, {
        id: id,
        viewBox: '0 0 20 20',
        refX: ref.x,
        refY: ref.y,
        markerWidth: 20 * scale,
        markerHeight: 20 * scale,
        orient: 'auto'
      });

      var defs = domQuery('defs', canvas._svg);

      if (!defs) {
        defs = svgCreate('defs');

        svgAppend(canvas._svg, defs);
      }

      svgAppend(defs, marker);

      markers[id] = marker;
    }

  function colorEscape(str) {
      return str.replace(/[()\s,#]+/g, '_');
    }

  function marker(type, fill, stroke) {

      var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

      if (!markers[id]) {
        createMarker(id, type, fill, stroke);
      }

      return 'url(#' + id + ')';
    }

  function createMarker(id, type, fill, stroke) {

      if (type === 'sequenceflow-end') {
        var sequenceflowEnd = svgCreate('path');
        svgAttr(sequenceflowEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

        addMarker(id, {
          element: sequenceflowEnd,
          ref: { x: 11, y: 10 },
          scale: 0.5,
          attrs: {
            fill: stroke,
            stroke: stroke
          }
        });
      }
    }

  // draw circle for start / end event for temporal constraint
  this.drawCircle = function(parentNode, width, height) {
    var cx = width / 2,
        cy = height / 2;

    var attrs = computeStyle(attrs, {
      stroke: DEFAULT_COLOR,
      strokeWidth: 2,
      fill: 'white'
    });

    var circle = svgCreate('circle');

    svgAttr(circle, {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4)
    });

    svgAttr(circle, attrs);

    svgAppend(parentNode, circle);

    return circle;
  };

  this.getCirclePath = function(shape) {
    var cx = shape.x + shape.width / 2,
        cy = shape.y + shape.height / 2,
        radius = shape.width / 2;

    var circlePath = [
      ['M', cx, cy],
      ['m', 0, -radius],
      ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
      ['a', radius, radius, 0, 1, 1, 0, -2 * radius],
      ['z']
    ];

    return componentsToPath(circlePath);
  };

  this.drawPath = function(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: 'black'
    });

    var path = svgCreate('path');
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  // this function will draw a line used as connection between the tast and start / end event
  this.drawStartEndTaskConnection = function(parentNode, element) {
      var attrs = computeStyle(attrs, {
        stroke: DEFAULT_COLOR,
        strokeWidth: 2
      });

     let connection = svgAppend(parentNode, createLine(element.waypoints, attrs));

    return connection;

    };

  // draw custom connection for non-contigent temporal constraint
  this.drawConnectionNonContigent = function(p, element) {
    var attrs = computeStyle(attrs, {
      stroke: DEFAULT_COLOR,
      strokeWidth: 2,
      markerEnd: marker('sequenceflow-end', 'white', 'black')

    });

    return svgAppend(p, createCurve(element.waypoints, attrs));
  };

  // draw custom connection for contigent temporal constraint
  this.drawConnectionContigent = function(p, element) {
    var attrs = computeStyle(attrs, {
      stroke: DEFAULT_COLOR,
      strokeWidth: 2,
      strokeDasharray: '10, 14',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      markerEnd: marker('sequenceflow-end', 'white', 'black')
    });

    let connection = svgAppend(p, createCurve(element.waypoints, attrs));

    return connection;
  };

  // get path of the custom connection regardless of the type ( contigent, non-contigent)
  this.getCustomConnectionPath = function(connection) {
    var waypoints = connection.waypoints.map(function(p) {
      return p.original || p;
    });

    var connectionPath = [
      ['M', waypoints[0].x, waypoints[0].y]
    ];

    waypoints.forEach(function(waypoint, index) {
      if (index !== 0) {
        connectionPath.push(['L', waypoint.x, waypoint.y]);
      }
    });

    return componentsToPath(connectionPath);
  };

  // this function creates the Start Node
  this.drawStartNode = function(p, element) {

      var circle = this.drawCircle(p, element.width, element.height);

      var pathData = customPathMap.getScaledPath('START_NODE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.60,
          my: 0.20
        }
      });


      var messagePath = this.drawPath(p, pathData, {
        strokeWidth: 2,
        fill: 'white',
        stroke: 'black'
      });

      return circle;
  };

  // this function creates the End Node
  this.drawEndNode = function(p, element) {

      var circle = this.drawCircle(p, element.width, element.height);

      var pathData = customPathMap.getScaledPath('END_NODE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.38,
          my: 0.15
        }
      });


      var messagePath = this.drawPath(p, pathData, {
        strokeWidth: 2,
        fill: 'white',
        stroke: 'black'
      });


      return circle;
  };

  // this function creates the Participation Node
  this.drawPNode = function(p, element) {

      var circle = this.drawCircle(p, element.width, element.height);

      var pathData = customPathMap.getScaledPath('PARTICIPATION_NODE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: -0.15,
          my: 0.25
        }
      });


      var messagePath = this.drawPath(p, pathData, {
        strokeWidth: 2,
        fill: 'white',
        stroke: 'black'
      });


      return circle;
  };
}

inherits(CustomRenderer, BaseRenderer);

CustomRenderer.$inject = [ 'eventBus', 'styles', 'customPathMap', 'bpmnRenderer', 'textRenderer','canvas'];


CustomRenderer.prototype.canRender = function(element) {
  var type = element.type;
  if(type === 'bpmn:Task' ){
    return true;
  }
  return /^td:/.test(element.type);
};

CustomRenderer.prototype.drawShape = function(p, element) {
  var type = element.type;

  if (type === 'td:StartNode') { return this.drawStartNode(p, element); }

  if (type === 'td:PNode') { return this.drawPNode(p, element); }

  if (type === 'td:EndNode') { return this.drawEndNode(p, element); }

  if (is(element, 'bpmn:Task')||is(element,'bpmn:ReceiveTask')||is(element,'bpmn:ServiceTask')) {

    const businessObject = getBusinessObject(element);
    const extensionElement = businessObject.extensionElements;
    var { name } = businessObject;
    var  minDuration  = businessObject;
    var  maxDuration  = businessObject;
    var  contigency  = businessObject;


    const shape = this.bpmnRenderer.drawShape(p, element);

    return shape;
  }

};

CustomRenderer.prototype.getShapePath = function(shape) {
  var type = shape.type;

  if (type === 'td:StartNode') { return this.getCirclePath(shape); }

  if (type === 'td:EndNode') { return this.getCirclePath(shape); }

  if (type === 'td:PNode') { return this.getCirclePath(shape); }

};

CustomRenderer.prototype.drawConnection = function(parentNode, element) {

  var type = element.type,
      businessObject = element.businessObject;

  if (type === 'td:CustomConnector') {

    var connection = this.drawStartEndTaskConnection(parentNode, element);

    return connection;
  }

  if (type === 'td:TemporalConstraint'){

    const businessObject = getBusinessObject(element);

    var {value} = businessObject;

    if(businessObject.value != ""){
    }

    let connection = this.drawConnectionContigent(parentNode, element);

    //console.log(connection.getArribute("d"));

     let refX = 0; // (element.waypoints[0].x - element.waypoints[1].x)/2;
     let refY = 0; // (element.waypoints[0].y - element.waypoints[1].y)/2;
     let maxL = -1, maxI = -1;
     for (let i = 0; i < element.waypoints.length - 1; i++) {
       let currentPoint = element.waypoints[i];
       let nextPoint = element.waypoints[i + 1];
       let segLen = (currentPoint.x - nextPoint.x) ** 2 + (currentPoint.y - nextPoint.y) ** 2
       if (segLen > maxL) {
         maxL = segLen;
         maxI = i;
       }
    }

    refX = (element.waypoints[maxI].x + element.waypoints[maxI + 1].x) / 2
    refY = (element.waypoints[maxI].y + element.waypoints[maxI + 1].y) / 2

    let refX1 = refX+3;
    let refY1 = refY-3;

    /*
    var text = svgCreate('text');

     svgAttr(text, {
       fill: 'black',
       transform: 'translate(' + refX1 + ',' + refY1 + ')'
     });

     svgClasses(text).add('djs-label');

     svgAppend(text, document.createTextNode(value));

     svgAppend(parentNode, text);

     */

    //svgAttr(text, {
   //   transform: "translate(" + refX + ", " + refY + ")"
   // });

    //console.log(refX);
    //console.log(refY);


   return connection;

    //return this.drawConnectionContigent(parentNode, element);
  }
  if (type === 'td:NonContigentConstraint'){

    return this.drawConnectionNonContigent(parentNode, element);
  }


};


CustomRenderer.prototype.getConnectionPath = function(connection) {

  var type = connection.type;

  if (type === 'td:CustomConnector') {
    return this.getCustomConnectionPath(connection);
  }


};
