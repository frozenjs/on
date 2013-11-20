define(function(require){
  'use strict';

  require('sinon');

  var bdd = require('intern!bdd');
  var chai = require('chai');
  var sinonChai = require('sinon-chai');
  chai.use(sinonChai);

  var expect = chai.expect;
  var describe = bdd.describe;
  var it = bdd.it;
  var beforeEach = bdd.beforeEach;

  var on = require('../main');
  var emit = require('../emit');
  var support = require('../support');

  var evt = document.createEvent('HTMLEvents');
  evt.initEvent('test', true, true, {});

  describe('DOM Events', function(){
    var testEl;
    var testInput;
    var noop;

    beforeEach(function(){
      testEl = document.createElement('div');
      testInput = document.createElement('input');
      testInput.setAttribute('type', 'text');
      noop = function noop(){};
    });

    describe('On', function(){

      it('should register a handler for custom event on a DOM element', function(){
        var spy = sinon.spy(testEl, 'addEventListener');
        on(testEl, 'test', noop);
        expect(spy).to.have.been.called;
      });

      it('should return a remover function that detaches handler on evocation', function(){
        var spy = sinon.spy(testEl, 'removeEventListener');
        var remover = on(testEl, 'test', noop);
        expect(remover).not.to.be.an('undefined');
        expect(remover.remove).to.be.a('function');
        remover.remove();
        expect(spy).to.have.been.called;
        expect(spy).to.have.been.calledWith('test');
      });

      it('should listen to and capture focus when given focusin on browsers that do not support it', function(){
        var spy = sinon.spy(testInput, 'addEventListener');
        on(testInput, 'focusin', noop);
        if(support['event-focusin']){
          expect(spy).to.have.been.calledWith('focusin', noop);
        } else {
          expect(spy).to.have.been.calledWith('focus', noop, true);
        }
      });

      it('should listen to and capture blur when given focusout on browsers that do not support it', function(){
        var spy = sinon.spy(testInput, 'addEventListener');
        on(testInput, 'focusout', noop);
        if(support['event-focusin']){
          expect(spy).to.have.been.calledWith('focusout', noop);
        } else {
          expect(spy).to.have.been.calledWith('blur', noop, true);
        }
      });

    });

    describe('Emit', function(){

      it('should emit a custom event on a DOM element', function(){
        var defer = this.async(1000, 2);

        var spy = sinon.spy(testEl, 'dispatchEvent');
        on(testEl, 'test', function(e){
          expect(e).to.be.an.instanceof(evt.constructor); // HTMLEvents
          expect(e.type).to.equal(evt.type);
          defer.resolve();
        });
        on(testEl, 'test', function(e){
          expect(e).to.be.an.instanceof(evt.constructor); // HTMLEvents
          expect(e.type).to.equal(evt.type);
          defer.resolve();
        });
        emit(testEl, 'test', evt);
        expect(spy).to.have.been.called;

        return defer;
      });

    });

  });

});
