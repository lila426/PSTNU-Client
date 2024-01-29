import inherits from 'inherits';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import {
  isAny,
  is
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  assign,
  bind
} from 'min-dash';


export default function CustomContextPadProvider(injector, connect, translate, autoPlace, elementFactory, create) {

  injector.invoke(ContextPadProvider, this);

  var cached = bind(this.getContextPadEntries, this);

  this.getContextPadEntries = function(element) {
    var actions = cached(element);

    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }

   /**
   * Create an append action
   *
   * @param {string} type
   * @param {string} className
   * @param {string} [title]
   * @param {Object} [options]
   *
   * @return {Object} descriptor
   */
  function appendAction(type, className, title, options) {

    if (typeof title !== 'string') {
      options = title;
      title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
    }

    function appendStart(event, element) {

      var shape = elementFactory.createShape(assign({ type: type }, options));
      create.start(event, shape, {
        source: element
      });
    }




    var append = autoPlace ? function(event, element) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      autoPlace.append(element, shape);
    } : appendStart;



    return {
      group: 'model',
      className: className,
      title: title,
      action: {
        dragstart: appendStart,
        click: append
      }
    };
  }

  function appendServiceTask(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({ type: 'bpmn:ServiceTask' });

        autoPlace.append(element, shape);
      } else {
        appendServiceTaskStart(event, element);
      }

      return { type : "custom:connectionStart"};

    }

    function appendServiceTaskStart(event) {
      const shape = elementFactory.createShape({ type: 'bpmn:ServiceTask' });

      create.start(event, shape, element);
    }


    if (isAny(businessObject, [
          'td:StartNode',
          'td:EndNode',
          'td:PNode'
        ])) {
        assign(actions, {

          'connect': {
            group: 'connect',
            className: 'bpmn-icon-connection',
            title: translate('Connect to element or add temporal constraint'),
            action: {
              click: startConnect,
              dragstart: startConnect
            }
          },
          'append.task': {
             group: 'model',
             className: 'bpmn-icon-task',
             title: translate('Append Task'),
             action: {
               click: appendServiceTaskStart,
               dragstart: appendServiceTaskStart
            }
          }

       });
     }

    return actions;
  };
}

inherits(CustomContextPadProvider, ContextPadProvider);

CustomContextPadProvider.$inject = [
  'injector',
  'connect',
  'translate',
  'autoPlace',
  'elementFactory',
  'create'
];
