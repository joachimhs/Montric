        ;(function() {
          var target_name = 'sproutcore/standard_theme' ;
          if (!SC.BUNDLE_INFO) throw "SC.BUNDLE_INFO is not defined!" ;
          if (SC.BUNDLE_INFO[target_name]) return ; 

          SC.BUNDLE_INFO[target_name] = {
            requires: ['sproutcore/empty_theme','sproutcore/debug','sproutcore/testing'],
            styles:   ['/static/sproutcore/standard_theme/en/current/stylesheet.css?1291500744'],
            scripts:  []
          }
        })();
