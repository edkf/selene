const gulp = require('gulp')
const lazypipe = require('lazypipe')
const gulpIf = require('gulp-if')
const concat = require('gulp-concat')
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps')
const stylus = require('gulp-stylus')
const rev = require('gulp-rev')
const util = require('gulp-util')

const postCSSautoprefixer = require('autoprefixer')
const postCSSmqpacker = require('css-mqpacker')
const postCSSnano = require('cssnano')

const crius = require('../manifest')
const writeToManifest = require('../utils/writeToManifest')

module.exports = {
  pipelines: {
    each: asset => {
      return (
        lazypipe()
          .pipe(() => gulpIf(crius.params.maps, sourcemaps.init()))
          .pipe(() =>
            gulpIf(
              '*.styl',
              stylus({
                include: ['./', './node_modules/'],
                'include css': true,
                use: [
                  stylusRenderer => {
                    const rootDirRegEx = /@(import|require)\s("|')?(#|~)/g
                    stylusRenderer.str = stylusRenderer.str.replace(
                      rootDirRegEx,
                      '@$1 $2'
                    )
                    return stylusRenderer
                  },
                ],
              })
            )
          )
          // Gulp 4. Appends vendor files to the main stream
          // Only if asset.vendor is defined
          .pipe(asset.vendor.length ? gulp.src : util.noop, asset.vendor, {
            passthrough: true,
          })
          .pipe(concat, asset.outputName)
          .pipe(postcss, [
            postCSSautoprefixer(),
            postCSSmqpacker(),
            postCSSnano({
              core: !crius.params.debug,
              discardComments: !crius.params.debug,
            }),
          ])
          .pipe(() =>
            gulpIf(
              crius.params.maps,
              sourcemaps.write('.', {
                sourceRoot: crius.config.paths.fromDistToSource,
              })
            )
          )
          .pipe(() => gulpIf(crius.params.production, rev()))
      )
    },
    merged: writeToManifest,
  },
}
