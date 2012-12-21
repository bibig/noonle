var assert = require('assert')
  , Browser = require('zombie')
  , browser = new Browser();

describe('try browser test', function() {

  it('access localhost', function(done) {
    browser.visit("http://localhost:3000", function() {
      assert.equal('Express', browser.text("title"));
      done();
    });
    
  });

  
  it('access ytji.com', function(done) {
    browser.visit("http://www.ytji.com", function() {
      assert.equal('盐糖记', browser.text("title"));
      done();
    });
  });
  

});
