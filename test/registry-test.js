var expect = require('./spec-helper').expect;
var minim = require('../lib/minim');
var ElementRegistry = require('../lib/registry');

describe('Minim registry', function() {
  var registry = new ElementRegistry();

  var ArrayElement, NullElement, ObjectElement, StringElement;

  beforeEach(function() {
    registry.elementMap = {};
    registry.elementDetection = [];
    registry.useDefault();

    ArrayElement = registry.getElementClass('array');
    NullElement = registry.getElementClass('null');
    ObjectElement = registry.getElementClass('object');
    StringElement = registry.getElementClass('string');
  });

  it('is used as the minim module', function() {
    expect(minim).to.be.an.instanceof(ElementRegistry);
  });

  it('is exposed on the module', function() {
    expect(minim.ElementRegistry).to.equal(ElementRegistry);
  });

  describe('default elements', function() {
    it('are present by default', function() {
      expect(registry.elementMap).to.not.be.empty();
    });

    it('can be created empty', function() {
      expect((new ElementRegistry(true)).elementMap).to.deep.equal({});
    });

    it('can be added after instantiation', function() {
      var testRegistry = new ElementRegistry(true);
      testRegistry.useDefault();
      expect(testRegistry.elementMap).to.not.be.empty();
    });
  });

  describe('#register', function() {
    it('should add to the element map', function() {
      registry.register('test', ObjectElement);
      expect(registry.elementMap.test).to.equal(ObjectElement);
    });
  });

  describe('#unregister', function() {
    it('should remove from the element map', function() {
      registry.unregister('test');
      expect(registry.elementMap).to.not.have.key('test');
    });
  });

  describe('#detect', function() {
    var test = function() { return true; }

    it('should prepend by default', function() {
      registry.elementDetection = [[test, NullElement]];
      registry.detect(test, StringElement);
      expect(registry.elementDetection[0][1]).to.equal(StringElement);
    });

    it('should be able to append', function() {
      registry.elementDetection = [[test, NullElement]];
      registry.detect(test, ObjectElement, false);
      expect(registry.elementDetection[1][1]).to.equal(ObjectElement);
    });
  });

  describe('#toElement', function() {
    it('should handle values that are ElementClass subclass instances', function() {
      var myElement = new StringElement();
      var converted = registry.toElement(myElement);

      expect(converted).to.equal(myElement);
    });

    it('should allow for roundtrip conversions for values', function() {
      registry.register('foo', StringElement);

      // Full version
      var fullVersion = registry.fromRefract({ element: 'foo', meta: {}, attributes: {}, content: 'test' }).toRefract();
      expect(fullVersion).to.deep.equal({ element: 'foo', meta: {}, attributes: {}, content: 'test' });

      // Compact version
      var compactValue = registry.fromCompactRefract(['foo', {}, {}, 'test']).toCompactRefract();
      expect(compactValue).to.deep.equal(['foo', {}, {}, 'test']);
    });

    it('should allow for roundtrip conversions for collection elements', function() {
      registry.register('foo', ArrayElement);

      var fullRefractSample = {
        element: 'foo',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'string',
            meta: {},
            attributes: {},
            content: 'bar'
          }
        ]
      }

      var compactRefractSample = [
        'foo', {}, {}, [
          ['string', {}, {}, 'bar']
        ]
      ]

      // Full version
      var fullVersion = registry.fromRefract(fullRefractSample).toRefract();
      expect(fullVersion).to.deep.equal(fullRefractSample);

      // Compact version
      var compactValue = registry.fromCompactRefract(compactRefractSample).toCompactRefract();
      expect(compactValue).to.deep.equal(compactRefractSample);
    });
  });

  describe('#getElementClass', function() {
    it('should return ElementClass for unknown elements', function() {
      expect(registry.getElementClass('unknown')).to.equal(registry.BaseElement);
    });
  });
});
