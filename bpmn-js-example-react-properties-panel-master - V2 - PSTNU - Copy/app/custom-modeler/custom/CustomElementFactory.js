import {
  assign
} from 'min-dash';

import inherits from 'inherits';

import BpmnElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import {
  DEFAULT_LABEL_SIZE
} from 'bpmn-js/lib/util/LabelUtil';

import {
  createModelBuilder
} from '../../helper/ModdleHelper';


/**
 * A custom factory that knows how to create BPMN _and_ custom elements.
 */
export default function CustomElementFactory(bpmnFactory, moddle) {
  BpmnElementFactory.call(this, bpmnFactory, moddle);



  /**
   * Create a diagram-js element with the given type (any of shape, connection, label).
   *
   * @param  {String} elementType (shape, connection, label)
   * @param  {Object} attrs
   *
   * @return {djs.model.Base}
   */
  this.create = function(elementType, attrs) {

    var type = attrs.type;

    attrs = attrs || {};

    // create the moddle model
    var createModel = createModelBuilder('../../app/moddle/');
    var model = createModel([ 'td' ]);

    if (elementType === 'label') {
      return this.baseCreate(elementType, assign({ type: 'label' }, DEFAULT_LABEL_SIZE, attrs));
    }

    // TODO replace element creation as async function ( JSON is read asyncronically )

    /*

    var resolvedFlag = true;

    let mypromise = function functionOne(testInput){
        console.log("Entered function");
        return new Promise((resolve ,reject)=>{
            setTimeout(
                ()=>{
                    let model = createModel([ 'td' ]);
                    console.log("Inside the promise");
                    if(resolvedFlag==true){
                        resolve(model);
                    }else{
                        reject("Rejected")
                    }
                } , 2000
            );
        });
    };

    mypromise().then((res)=>{
        console.log(`The function recieved with value ${res}`)
        console.log(res);
    }).catch((error)=>{
        console.log(`Handling error as we received ${error}`);
    });

    */

    // set attributes accoring to types
    if (type === "td:StartNode") {

      // it should create a BpmnModdle element
      var instance = model.create('td:StartNode');

      //it should provide descriptor from meta model
      var descriptor = model.getElementDescriptor(instance);

      // create businessObject with attributes
      if (!attrs.businessObject) {
        attrs.businessObject = {
          type: type
        };

        // add id to businessObject
        if (attrs.id) {
          assign(attrs.businessObject, {
            id: attrs.id
          });
        }
      }

      // we mimic the ModdleElement API to allow interoperability with
      // other components, i.e. the Modeler and Properties Panel

      assign(attrs, this._getCustomElementSize(type));
      assign(attrs, this._setModel(attrs, moddle));
      assign(attrs, this._setDescriptor(attrs, descriptor));
      assign(attrs, this._setInstanceOf(attrs, type));
      assign(attrs, this._setGet(attrs));
      assign(attrs, this._setSet(attrs));


      // END minic ModdleElement API

      return this.createBpmnElement(elementType, attrs);
    }

    if (type === "td:PNode") {

      // it should create a BpmnModdle element
      var instance = model.create('td:PNode');

      //it should provide descriptor from meta model
      var descriptor = model.getElementDescriptor(instance);

      // create businessObject with attributes
      if (!attrs.businessObject) {
        attrs.businessObject = {
          type: type
        };

        // add id to businessObject
        if (attrs.id) {
          assign(attrs.businessObject, {
            id: attrs.id
          });
        }
      }

      // we mimic the ModdleElement API to allow interoperability with
      // other components, i.e. the Modeler and Properties Panel

      assign(attrs, this._getCustomElementSize(type));
      assign(attrs, this._setModel(attrs, moddle));
      assign(attrs, this._setDescriptor(attrs, descriptor));
      assign(attrs, this._setInstanceOf(attrs, type));
      assign(attrs, this._setGet(attrs));
      assign(attrs, this._setSet(attrs));


      // END minic ModdleElement API

      return this.createBpmnElement(elementType, attrs);
    }

    if (type === "td:EndNode") {

      // it should create a BpmnModdle element
      var instance = model.create('td:EndNode');

      //it should provide descriptor from meta model
      var descriptor = model.getElementDescriptor(instance);

      // create businessObject with attributes
      if (!attrs.businessObject) {
        attrs.businessObject = {
          type: type
        };

        // add id to businessObject
        if (attrs.id) {
          assign(attrs.businessObject, {
            id: attrs.id
          });
        }
      }

      // we mimic the ModdleElement API to allow interoperability with
      // other components, i.e. the Modeler and Properties Panel

      assign(attrs, this._getCustomElementSize(type));
      assign(attrs, this._setModel(attrs, moddle));
      assign(attrs, this._setDescriptor(attrs, descriptor));
      assign(attrs, this._setInstanceOf(attrs, type));
      assign(attrs, this._setGet(attrs));
      assign(attrs, this._setSet(attrs));


      // END minic ModdleElement API

      return this.createBpmnElement(elementType, attrs);
    }

    return this.createBpmnElement(elementType, attrs);
 };
}

inherits(CustomElementFactory, BpmnElementFactory);

CustomElementFactory.$inject = [
  'bpmnFactory',
  'moddle'
];


/**
 * Returns the default size of custom shapes.
 *
 * The following example shows an interface on how
 * to setup the custom shapes's dimensions.
 *
 * @example
 *
 * var shapes = {
 *   task: { width: 100, height: 80 },
 *   rectangle: { width: 100, height: 20 }
 * };
 *
 * return shapes[type];
 *
 *
 * @param {String} type
 *
 * @return {Dimensions} a {width, height} object representing the size of the element
 */
CustomElementFactory.prototype._getCustomElementSize = function(type) {
  var shapes = {
    __default: { width: 100, height: 80 },
    'td:StartNode': { width:36, height: 36 },
    'td:EndNode': { width: 36, height: 36 },
    'td:PNode': { width: 36, height: 36 }
  };

  return shapes[type] || shapes.__default;
};


/**
 * Sets the attribute $model for a new bpmn element
 *
 *
 * @param {Object} attributes of a BpmnElement where we want to add the model
 *
 * @param {Object} a BpmnModdle object that describes types, properties and relationships
 *
 * @return {Object} the BpmnModdle object
 */
CustomElementFactory.prototype._setModel = function(attrs, model) {

    return Object.defineProperty(attrs.businessObject, '$model', {
      value: model
    });

};

/**
 * Sets the attribute $descriptor for a new bpmn element
 *
 *
 * @param {Object} attributes of a BpmnElement where we want to add the descriptor
 *
 * @param {Object} an object created from the JSON meta-model
 *
 * @return {Object} the BpmnModdle object
 */
CustomElementFactory.prototype._setDescriptor = function(attrs, descriptor) {

    return Object.defineProperty(attrs.businessObject, '$descriptor', {
      value: descriptor
    });

};

/**
 * Sets the attribute $instanceOf for a new bpmn element
 *
 *
 * @param {Object} attributes of a BpmnElement where we want to add the model
 *
 * @param {Object} a BpmnModdle object that describes types, properties and relationships
 *
 * @return {Object} the BpmnModdle object
 */
CustomElementFactory.prototype._setInstanceOf = function(attrs, type) {

    return Object.defineProperty(attrs.businessObject, '$instanceOf', {
      value: function(type) {
        return this.type === type;
      }
    });
};

/**
 * Sets the attribute get for a new bpmn element
 *
 *
 * @param {Object} attributes of a BpmnElement where we want to add the model
 *
 * @return {Object} the get function
 */
CustomElementFactory.prototype._setGet = function(attrs) {

    return Object.defineProperty(attrs.businessObject, 'get', {
      value: function(key) {
        return this[key];
      }
    });
};

/**
 * Sets the attribute set for a new bpmn element
 *
 *
 * @param {Object} attributes of a BpmnElement where we want to add the model
 *
 * @return {Object} the set function
 */
CustomElementFactory.prototype._setSet = function(attrs) {

    return Object.defineProperty(attrs.businessObject, 'set', {
      value: function(key, value) {
        return this[key] = value;
      }
    });
};
