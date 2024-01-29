import {
  reduce,
  assign
} from 'min-dash';

import inherits from 'inherits';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import elementRegistry from 'diagram-js/lib/core/ElementRegistry'

var HIGH_PRIORITY = 1500;


function isCustom(element) {
  return element && /^td:/.test(element.type);
}



/**
 * Specific rules for custom elements
 */
export default function CustomRules(eventBus, bpmnjs) {
  RuleProvider.call(this, eventBus);
}

inherits(CustomRules,  RuleProvider);

function getElementById(bpmnjs, id){
  // get the registry to look for the element there
  var elementRegistry = bpmnjs.get('elementRegistry');
  // get the element from the element registry
  var element = elementRegistry.get(id);
  return element;
 }

CustomRules.$inject = [ 'eventBus', 'bpmnjs'];


CustomRules.prototype.init = function() {

  /**
   * Utility functions for rule checking
   */

  /**
   * Checks if given element can be used for starting connection.
   */
   function getOrganizationalParent(element) {

     do {
       if (is(element, 'bpmn:Process')) {
         return getBusinessObject(element);
       }

       if (is(element, 'bpmn:Participant')) {
         return (
           getBusinessObject(element).processRef ||
           getBusinessObject(element)
         );
       }
     } while ((element = element.parent));
   }

   function isSameOrganization(a, b) {
    var parentA = getOrganizationalParent(a),
        parentB = getOrganizationalParent(b);

    return parentA === parentB;
  }



    function updateId(bpmnjs, element, newId){

      var modeling = bpmnjs.get('modeling');

      modeling.updateProperties(element, {
        id: newId
      });

      return element;
     }


    function getIncomingTypes(element){

      let elementTypes = [];
      for (let i = 0; i < element.incoming.length; i++) {
         let elementType = element.incoming[i].source.type;
         elementTypes.push(elementType);
      }
      return elementTypes;
    }

    function getOutgoingTypes(element){

      let elementTypes = [];
      for (let i = 0; i < element.outgoing.length; i++) {
         let elementType = element.outgoing[i].target.type;
         elementTypes.push(elementType);
      }
      return elementTypes;
    }

   /**
    * Can shape be created on target container?
    */
   function canCreate(shape, target) {
      // only judge about custom elements
      if (!isCustom(shape)) {
        return;
      }
      // allow creation on processes
      return is(target, 'bpmn:Process') || is(target, 'bpmn:Participant') || is(target, 'bpmn:Collaboration');
    }

   /**
    * Can source and target be connected?
    */
   function canConnect(source, target) {

     let businessObject;

     let connectionExists = false;

     /*
     // only judge about custom elements
     if (!isCustom(source) && !isCustom(target)) {
       return;
     }
     */

    // connecting from Start Node to Task
    if (is(source, "td:StartNode") ){
       if (is(target, "bpmn:Task")) {
         let incomingTypes = getIncomingTypes(target);
         let outgoingTypes = getOutgoingTypes(target);
         if(incomingTypes.includes("td:StartNode") || outgoingTypes.includes("td:StartNode")){
           return;
         }else if(source.incoming.length === 0 && source.outgoing.length === 0){
            return { type : "td:CustomConnector"};
         }
       }
    }

    // connecting from End Node to Task
    if (is(source, "td:EndNode") ){
       if (is(target, "bpmn:Task")) {
         let incomingTypes = getIncomingTypes(target);
         let outgoingTypes = getOutgoingTypes(target);
         if(incomingTypes.includes("td:EndNode") || outgoingTypes.includes("td:EndNode")){
           return;
         }else if(source.incoming.length === 0 && source.outgoing.length === 0){
            return { type : "td:CustomConnector"};
         }
       }
    }

    // connecting from Task to End Node
    if (is(source, "bpmn:Task") ){
       if (is(target, "td:EndNode")) {
         let incomingTypes = getIncomingTypes(source);
         let outgoingTypes = getOutgoingTypes(source);
         if(incomingTypes.includes("td:EndNode") || outgoingTypes.includes("td:EndNode")){
           return;
         }else if(target.incoming.length === 0 && target.outgoing.length === 0){
            return { type : "td:CustomConnector"};
         }
       }
    }

    // connecting from Task to Start Node
    if (is(source, "bpmn:Task") ){
       if (is(target, "td:StartNode")) {
         let incomingTypes = getIncomingTypes(source);
         let outgoingTypes = getOutgoingTypes(source);
         if(incomingTypes.includes("td:StartNode") || outgoingTypes.includes("td:StartNode")){
           return;
         }else if(target.incoming.length === 0 && target.outgoing.length === 0){
            return { type : "td:CustomConnector"};
         }
       }
    }


    // connecting from Task to Start or End Node
   if (is(source, "td:StartNode")){
       if (is(target, "td:EndNode")  || is(target, "td:StartNode")) {
         return { type : "td:TemporalConstraint"};
       }
   }

    // connecting from Parameter Node to Start or End Node
    if (is(source, "td:PNode")){
        if (is(target, "td:EndNode") || is(target, "td:StartNode")) {
          return { type : "td:TemporalConstraint"};
        }
    }

    // connecting from Start or End Node to Parameter Node
    if (is(source, "td:EndNode") ){
        if (is(target, "td:StartNode")) {
          return { type : "td:TemporalConstraint"};
        }
    }

    // connecting from Start or End Node to Parameter Node
    if (is(source, "td:EndNode") || is(source, "td:StartNode") || is(source, "bpmn:StartEvent")){
        if (is(target, "td:PNode")) {
          return { type : "td:TemporalConstraint"};
        }
    }


    // connecting from Start or End Node to Parameter Node
    if (is(source, "bpmn:StartEvent")){
        if (is(target, "bpmn:EndEvent") || is(target, "td:StartNode")) {
          return { type : "td:TemporalConstraint"};
        }
    }


     /*
     // allow conection between start / end of task custom shapes and elements
     if( isCustom(source)){
       if (is(source, 'td:StartNode')){
         if (is(target, 'bpmn:Task')){
           let connectionExists = false;
           for (let i = 0; i < target.incoming.length; i++) {
             if(target.incoming[i].type == "td:CustomConnector"){
               connectionExists = true;
               break;
             }
           }
           for (let i = 0; i < source.outgoing.length; i++) {
             if(source.outgoing[i].type == "td:CustomConnector"){
               connectionExists = true;
               break;
             }
           }
         if(connectionExists == false){
           return { type : 'td:CustomConnector'};
         }

       } else if (is(target, 'td:StartNode') || is(target, 'td:EndNode')) {
         //if(source.outgoing[0].)
         //console.log(target.incoming[0]);
         console.log(source);
         console.log(target);

         if(source.outgoing[0].businessObject.target != target.outgoing[0].businessObject.target )
            //&& source.outgoing[0].businessObject.target != target.incoming[0].businessObject.source
           // && source.incoming[0].businessObject.source != target.outgoing[0].businessObject.target
           // && source.incoming[0].businessObject.source != target.incoming[0].businessObject.source)
           {
           return { type : 'custom:ContigentConstraint'};
         }

          //return { type : 'custom:ContigentConstraint'};
       }

     }

       if (is(source, 'td:EndNode')){
       if (is(target, 'bpmn:Task')){
         let connectionExists = false;
         for (let i = 0; i < target.incoming.length; i++) {
           if(target.incoming[i].type == "custom:connectionEnd"){
             connectionExists = true;
             break;
           }
         }
         for (let i = 0; i < source.outgoing.length; i++) {
           if(source.outgoing[i].type == "custom:connectionEnd"){
             connectionExists = true;
             break;
           }
         }
       if(connectionExists == false){
         return { type : 'custom:connectionEnd'};
       }

     } else if (is(target, 'td:StartNode') || is(target, 'td:EndNode')) {
       //if(source.outgoing[0].)
       //console.log(target.incoming[0]);
       console.log(source);
       console.log(target);

       if(source.outgoing[0].businessObject.target != target.outgoing[0].businessObject.target )
          //&& source.outgoing[0].businessObject.target != target.incoming[0].businessObject.source
         // && source.incoming[0].businessObject.source != target.outgoing[0].businessObject.target
         // && source.incoming[0].businessObject.source != target.incoming[0].businessObject.source)
         {
         return { type : 'custom:ContigentConstraint'};
       }

        //return { type : 'custom:ContigentConstraint'};
     }else if (target, 'custom:PTask') {
       // if P element is not connected to anything else
       if( source.incoming.length === 0 && source.outgoing.length === 1){
             return { type : 'custom:ContigentConstraint'};
       }
     }


   }

      // WORK HERE //
      if(is(source, 'custom:PTask')){
        //console.log(target.businessObject);
        console.log("SEE ORG PARENT HERE");
        console.log(source.incoming[0].businessObject.source);
        // get the registry to look for the element there
        //var elementRegistry = bpmnDiagram.get('elementRegistry');
        // get the element from the element registry
        var element = getElementById(bpmnjs,source.incoming[0].businessObject.source);
        console.log("////////////");
        console.log(element);
        console.log("////////////");
        console.log(source.incoming[0].businessObject);
        // if this element is already connected to something else
        if( source.incoming.length === 1){
          if(isSameOrganization(element,target) === false){
            return { type : 'custom:ContigentConstraint'};
          }
        }
      }

   } else if (isCustom(target)) {
     if (is(target, 'td:StartNode')){
       if (is(source, 'bpmn:Task')){
         let connectionExists = false;
         for (let i = 0; i < target.incoming.length; i++) {
           if(source.incoming[i].type == "td:CustomConnector"){
             connectionExists = true;
             break;
           }
         }
         for (let i = 0; i < target.outgoing.length; i++) {
           if(target.outgoing[i].type == "td:CustomConnector"){
             connectionExists = true;
             break;
           }
         }
       if(connectionExists == false){
         return { type : 'td:CustomConnector'};
       }

     } else if (is(source, 'td:StartNode') || is(source, 'td:EndNode')) {
       //if(source.outgoing[0].)
       //console.log(target.incoming[0]);
       //console.log(source);
       //console.log(target);

       if(source.outgoing[0].businessObject.target != target.outgoing[0].businessObject.target )
          //&& source.outgoing[0].businessObject.target != target.incoming[0].businessObject.source
         // && source.incoming[0].businessObject.source != target.outgoing[0].businessObject.target
         // && source.incoming[0].businessObject.source != target.incoming[0].businessObject.source)
         {
         return { type : 'custom:ContigentConstraint'};
       }

        //return { type : 'custom:ContigentConstraint'};
     }

   }

     if (is(target, 'td:EndNode')){
     if (is(source, 'bpmn:Task')){
       let connectionExists = false;
       for (let i = 0; i < source.incoming.length; i++) {
         if(source.incoming[i].type == "custom:connectionEnd"){
           connectionExists = true;
           break;
         }
       }
       for (let i = 0; i < target.outgoing.length; i++) {
         if(target.outgoing[i].type == "custom:connectionEnd"){
           connectionExists = true;
           break;
         }
       }
     if(connectionExists == false){
       return { type : 'custom:connectionEnd'};
     }

   } else if (is(source, 'td:StartNode') || is(source, 'td:EndNode')) {
     //if(source.outgoing[0].)
     //console.log(target.incoming[0]);
     //console.log(source);
     //console.log(target);

     if(source.outgoing[0].businessObject.target != target.outgoing[0].businessObject.target )
        //&& source.outgoing[0].businessObject.target != target.incoming[0].businessObject.source
       // && source.incoming[0].businessObject.source != target.outgoing[0].businessObject.target
       // && source.incoming[0].businessObject.source != target.incoming[0].businessObject.source)
       {
       return { type : 'custom:ContigentConstraint'};
     }

      //return { type : 'custom:ContigentConstraint'};
   }

   }

     if(is(target, 'custom:PTask')){
       return{ type : 'custom:ContigentConstraint'}
     }
   } */

     // allow connection between start / end of task custom shapes and elements
     /*
     if (isCustom(source)) {
       if (is(target, 'bpmn:Task')) {
         let { contigency } = target.businessObject;
         source.businessObject.set("contigency",contigency);
         return { type: 'custom:connection' };
       } else if (isCustom(target)){
         if (target.businessObject.contigency == 1 && source.businessObject.contigency == 1){
           return { type: 'custom:ContigentConstraint' };
         } else if (target.businessObject.contigency == 0 && source.businessObject.contigency == 0){
           return { type: 'custom:NonContigentConstraint'};
         } else {
           return false;
         }
       } else {
         return false;
       }
     } else if (isCustom(target)) {
       if (is(source, 'td:EndNode')) {
         return { type: 'custom:ContigentConstraint' };
       }  else if (isCustom(source)){
         if (target.businessObject.contigency == 1 && source.businessObject.contigency == 1){
           return { type: 'custom:ContigentConstraint' };
         } else if (target.businessObject.contigency == 0 && source.businessObject.contigency == 0){
           return { type: 'custom:NonContigentConstraint'};
         } else {
           return false;
         }
       } else {
         return false;
       }
     }
     */

   }



  this.addRule('elements.move', HIGH_PRIORITY, function(context) {

    var target = context.target,
        shapes = context.shapes;

    var type;

    // do not allow mixed movements of custom / BPMN shapes
    // if any shape cannot be moved, the group cannot be moved, too
    var allowed = reduce(shapes, function(result, s) {
      if (type === undefined) {
        type = isCustom(s);
      }

      if (type !== isCustom(s) || result === false) {
        return false;
      }

      return canCreate(s, target);
    }, undefined);

    // reject, if we have at least one
    // custom element that cannot be moved
    return allowed;
  });

  this.addRule('shape.create', HIGH_PRIORITY, function(context) {
    var target = context.target,
        shape = context.shape;

    return canCreate(shape, target);
  });

  this.addRule('shape.resize', HIGH_PRIORITY, function(context) {
    var shape = context.shape;

    if (isCustom(shape)) {
      // cannot resize custom elements
      return false;
    }
  });

  this.addRule('connection.create', HIGH_PRIORITY, function(context) {
    var source = context.source,
        target = context.target;

    return canConnect(source, target);
  });

  this.addRule('connection.reconnectStart', HIGH_PRIORITY, function(context) {
    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.reconnectEnd', HIGH_PRIORITY, function(context) {
    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;

    return canConnect(source, target, connection);
  });

};
