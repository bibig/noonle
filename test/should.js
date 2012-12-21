var should = require('should');

var user = {
    name: 'tj'
  , pets: ['tobi', 'loki', 'jane', 'bandit']
};

describe('try should', function() {
  it ('have property', function(done) {
    user.should.have.property('name', 'tj');
    user.should.have.property('pets').with.lengthOf(4);
    done();
  });
});
