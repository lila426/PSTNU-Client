import { is } from 'bpmn-js/lib/util/ModelUtil';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import React, { Component, useState } from 'react';

import './PropertiesView.css';


export default class PropertiesView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedElements: [],
      element: null
    };

  }

  componentDidMount() {

    const {
      modeler
    } = this.props;

    modeler.on('selection.changed', (e) => {

      const {
        element
      } = this.state;

      this.setState({
        selectedElements: e.newSelection,
        element: e.newSelection[0]
      });
    });


    modeler.on('element.changed', (e) => {

      const {
        element
      } = e;

      const {
        element: currentElement
      } = this.state;

      if (!currentElement) {
        return;
      }

      // update panel, if currently selected element changed
      if (element.id === currentElement.id) {
        this.setState({
          element
        });
      }

    });
  }

  render() {

    const {
      modeler
    } = this.props;

    const {
      selectedElements,
      element
    } = this.state;

    return (
      <div>

        {
          selectedElements.length === 1
            && <ElementProperties modeler={ modeler } element={ element } />
        }

        {
          selectedElements.length === 0
            && <span>Please select an element.</span>
        }

        {
          selectedElements.length > 1
            && <span>Please select a single element.</span>
        }
      </div>
    );
  }


}


function ElementProperties(props) {

  let {
    element,
    modeler
  } = props;

  if (element.labelTarget) {
    element = element.labelTarget;
  }


  // store values of input fields for BPMN:Task extensions
  const [minDurationTask, setMinDurationTask] = useState("");
  const [maxDurationTask, setMaxDurationTask] = useState("");
  const [contingencyTask, setContingencyTask] = useState('1');
  const [prepLabelTask, setPrepLabelTask] = useState('');

  // store values of input fields for BPMN:ExclusiveGateway or BPMN:ParallelGateway
  const [minDurationGate, setMinDurationGate] = useState('');
  const [maxDurationGate, setMaxDurationGate] = useState('');
  const [prepLabelGate, setPrepLabelGate] = useState('');

  // store values of observational labels
  const [observationalLabel, setObservationalLabel] = useState('');

  // store values of input fields for temporal DurationConstraintTask
  const [temporalConstraintValue, setTemporalConstraintValue] = useState("");
  const [temporalConstraintType, setTemporalConstraintType] = useState("");


  // store values of input fields for exclusive gateway split branches
  const [branch, setBranch] = useState('1');


  function updateTopic(topic) {
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:topic': topic
    });
  }

  function getExtensionElement(element, type) {
  if (!element.extensionElements) {
    return;
  }

  return element.extensionElements.values.filter((extensionElement) => {
    return extensionElement.$instanceOf(type);
  })[0];
}


  function saveDurationConstrainsTask(event, element) {

   event.preventDefault(); // prevent page refresh

   const modeling = modeler.get('modeling');
   const moddle = modeler.get('moddle');

   var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

   let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintTask");

   if (!durationConstraint) {
     durationConstraint = moddle.create("td:DurationConstraintTask");

     extensionElements.get('values').push(durationConstraint);
   }

   durationConstraint.minDuration = minDurationTask;
   durationConstraint.maxDuration = maxDurationTask;
   durationConstraint.contigency = contingencyTask;


   // not doable because change in label will change name
   let name = element.businessObject.name;

   let newLabel = name.concat(" [", minDurationTask, ",", maxDurationTask,"]");

   modeling.updateProperties(element, {
   extensionElements
  });

  modeling.updateLabel(element, newLabel);

  // step 1. UBC added

  console.log(element);










  }

  function savePrepositionalLabelsTask(event, element){
    event.preventDefault(); // prevent page refresh

    const modeling = modeler.get('modeling');
    const moddle = modeler.get('moddle');

    var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

    let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintTask");

    if (!durationConstraint) {
      durationConstraint = moddle.create("td:DurationConstraintTask");

      extensionElements.get('values').push(durationConstraint);
    }

    durationConstraint.prepLabel = prepLabelTask;

    modeling.updateProperties(element, {
    extensionElements
   });
  }

  function saveDurationConstrainsGate(event, element) {

    event.preventDefault();
    const modeling = modeler.get('modeling');
    const moddle = modeler.get('moddle');

    var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

    let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintGateway");

    if (!durationConstraint) {
      durationConstraint = moddle.create("td:DurationConstraintGateway");

      extensionElements.get('values').push(durationConstraint);
    }

    durationConstraint.minDuration = minDurationGate;
    durationConstraint.maxDuration = maxDurationGate;


    modeling.updateProperties(element, {
    extensionElements
   });
  }

  function savePrepositionalLabelsGate(event, element) {

    event.preventDefault();
    const modeling = modeler.get('modeling');
    const moddle = modeler.get('moddle');

    var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

    let durationConstraint = getExtensionElement(element.businessObject, "td:DurationConstraintGateway");

    if (!durationConstraint) {
      durationConstraint = moddle.create("td:DurationConstraintGateway");

      extensionElements.get('values').push(durationConstraint);
    }

    durationConstraint.prepLabel = prepLabelGate;

    modeling.updateProperties(element, {
    extensionElements
   });
  }

function saveObservationalLabel(event,element){

      event.preventDefault();
      const modeling = modeler.get('modeling');
      const moddle = modeler.get('moddle');

      var extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

      let label = getExtensionElement(element.businessObject, "td:ObservationalLabel");

      if (!label) {
        label = moddle.create("td:ObservationalLabel");

        extensionElements.get('values').push(label);
      }

      label.obserLabel = observationalLabel;

      modeling.updateProperties(element, {
      extensionElements
     });
}

function saveTemporalConstraints(event,element){
  event.preventDefault();
  const modeling = modeler.get('modeling');
  const moddle = modeler.get('moddle');

  const axios = require('axios');

  const putURL = 'http://localhost:3333/translationCSTNU/Constraint'

  let putData;

  let axiosConfig = {
      headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          "Access-Control-Allow-Origin": "*",
      }
  };

  console.log(temporalConstraintValue);


  var businessObject = element.businessObject;
  var parent = element.parent;
  var extensionElements = parent.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

  let constraint = getExtensionElement(parent.businessObject, "td:TemporalConstraint");

  if (!constraint) {
    constraint = moddle.create("td:TemporalConstraint");

    extensionElements.get('values').push(constraint);
  }

  constraint.constraintType = temporalConstraintType;
  constraint.constraintValue = temporalConstraintValue;

  putData = {
        id: element.businessObject.id,
        Source: element.businessObject.source,
        Target: element.businessObject.target,
        Value: temporalConstraintValue,
        Type: "constraint",
        LabeledValues: null
  }


  modeling.updateProperties(parent, {
      extensionElements
    });


     axios
       .put(putURL, putData, axiosConfig)
       .then(res => {
         console.log(`statusCode: ${res.status}`);
         console.log(res);
       })
       .catch(error => {
         console.error(error);
       });

       



}

function updateName(event, element) {

    event.preventDefault();
    let newName = event.target.value;

    const modeling = modeler.get('modeling');

    modeling.updateLabel(element, newName);

    console.log(element);

  }


function saveBranch(event, element){
  event.preventDefault();
  const modeling = modeler.get('modeling');


    modeling.updateProperties(element, {
      'td:branchValue': branch
    });
}

  return (
    <div className="element-properties" key={ element.id }>
      <fieldset>
        <label>ID</label>
        <span>{ element.id }</span>
      </fieldset>

      {
        is(element, 'bpmn:Participant') &&
        <fieldset>
          <label>Name</label>
          <input value={ element.businessObject.name || '' } onChange={ (event) => {
            updateName(event, element)
          } } />
        </fieldset>
      }

      {
        is(element, 'bpmn:Task') &&
        <form>
        <fieldset>
          <label>Minimum Duration</label>
          <input value={ minDurationTask } onChange={event => setMinDurationTask(event.target.value)} />
          <label>Maximum Duration</label>
          <input value={ maxDurationTask } onChange={event => setMaxDurationTask(event.target.value)} />
          <label>Contingency</label>
            <select name="Contingency" value={ contingencyTask } onChange={event => setContingencyTask(event.target.value)}>
              <option value="0">Non-Contingent</option>
              <option value="1">Contingent</option>
              //TODO extend with semi-contingent options
            </select>
            <button onClick={ (event) => { saveDurationConstrainsTask (event, element)} }>Save Duration Constrains</button>
        </fieldset>

        </form>
      }

      {
        is(element, 'bpmn:SequenceFlow') && is(element.source, 'bpmn:ExclusiveGateway') &&
        <form>
        <fieldset>
          <label>Set Branch</label>
            <select name="Branch" value={ branch } onChange={event => setBranch(event.target.value)}>
              <option value="0">False</option>
              <option value="1">True</option>
            </select>
            <button onClick={ (event) => { saveBranch (event, element)} }>Save Branch Settings</button>
        </fieldset>
        </form>
      }

      {
        is(element, 'bpmn:ExclusiveGateway')  &&
        <form>
        <fieldset>
          <label>Minimum Duration</label>
          <input value={ minDurationGate } onChange={event => setMinDurationGate(event.target.value)} />
          <label>Maximum Duration</label>
          <input value={ maxDurationGate } onChange={event => setMaxDurationGate(event.target.value)} />
          <button onClick={ (event) => { saveDurationConstrainsGate (event, element)} }>Save Duration Constrains</button>
        </fieldset>
        <fieldset>
          <label>Prepositional Label</label>
          <input value={prepLabelGate} onChange={event => setPrepLabelGate(event.target.value)}/>
          <button onClick={ (event) => { savePrepositionalLabelsGate(event, element)} }>Save Prepositional Labels</button>
        </fieldset>
        <fieldset>
          <label>Observational Label</label>
          <input value={observationalLabel} onChange={event => setObservationalLabel(event.target.value)}/>
          <button onClick={ (event) => { saveObservationalLabel(event, element)} }>Save Observational Label</button>
        </fieldset>
        </form>
      }

      {
       is(element, 'bpmn:ParallelGateway') &&
        <form>
        <fieldset>
          <label>Minimum Duration</label>
          <input value={ minDurationGate } onChange={event => setMinDurationGate(event.target.value)} />
          <label>Maximum Duration</label>
          <input value={ maxDurationGate } onChange={event => setMaxDurationGate(event.target.value)} />
          <button onClick={ (event) => { saveDurationConstrainsGate (event, element)} }>Save Duration Constrains</button>
        </fieldset>
        <fieldset>
          <label>Prepositional Label</label>
          <input value={prepLabelGate} onChange={event => setPrepLabelGate(event.target.value)}/>
          <button onClick={ (event) => { savePrepositionalLabelsGate(event, element)} }>Save Prepositional Labels</button>
        </fieldset>
        </form>
      }

      {
       is(element, 'td:TemporalConstraint') &&
      <form>
        <fieldset>
        <label>Value</label>
        <input value={ temporalConstraintValue } onChange={event => setTemporalConstraintValue(event.target.value)} />
        <label>Constraint Type</label>
          <select name="ConstraintType" value={ temporalConstraintType } onChange={event => setTemporalConstraintType(event.target.value)}>
            <option value="0">Lower Bound Constraint</option>
            <option value="1">Upper Bound Constraint</option>
          </select>
          <button onClick={ (event) => { saveTemporalConstraints (event, element)} }>Save Temporal Constrains</button>
      </fieldset>
      </form>
      }

    </div>
  );
}


// helpers ///////////////////

function hasDefinition(event, definitionType) {

  const definitions = event.businessObject.eventDefinitions || [];

  return definitions.some(d => is(d, definitionType));
}
