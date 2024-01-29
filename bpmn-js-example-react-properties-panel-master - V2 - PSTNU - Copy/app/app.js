import CustomModeler from './custom-modeler';

import PropertiesPanel from './properties-panel';

import customModdleExtension from './moddle/custom.json';

import tdModdleExtension from './moddle/td.json';

import diagramXML from './newDiagram.bpmn';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import MyCommandInterceptor from "./command-interceptor/CSTNUCommandInterceptor";

import $ from 'jquery';

import {
  debounce
} from 'min-dash';

const HIGH_PRIORITY = 1500;

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');


const modeler = new CustomModeler({
  container: $modelerContainer,
  moddleExtensions: {
    custom: customModdleExtension,
    td:tdModdleExtension
  },
  keyboard: {
    bindTo: document.body
  },
  additionalModules: [MyCommandInterceptor]
});

const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});

modeler.importXML(diagramXML);


// bootstrap diagram functions

$(function() {

/*
  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });
*/
  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');
  var downloadJsonLink = $('#js-download-json');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(async function() {

    modeler.addCustomElements();
    modeler.removeCustomElement();

    try {

      const { svg } = await modeler.saveSVG();

      setEncoded(downloadSvgLink, 'diagram.svg', svg);
    } catch (err) {

      console.error('Error happened saving SVG: ', err);

      setEncoded(downloadSvgLink, 'diagram.svg', null);
    }

    try {

      const { xml } = await modeler.saveXML({ format: true });

      setEncoded(downloadLink, 'diagram.bpmn', xml);
    } catch (err) {

      console.error('Error happened saving diagram: ', err);

      setEncoded(downloadLink, 'diagram.bpmn', null);
    }

    try {

      const { xml } = await modeler.saveXML({ format: true });

      var xml2js = require('xml2js');
      var parseString = require('xml2js').parseString;
      parseString(xml, function (err, result) {
        var json = JSON.stringify(result);
        setEncoded(downloadJsonLink, 'diagram.json', json);

      });

    } catch (err) {

      console.error('Error happened saving diagram: ', err);

      setEncoded(downloadJsonLink, 'diagram.json', null);
    }
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);



});
