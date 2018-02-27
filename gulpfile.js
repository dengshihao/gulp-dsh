/**
 * Created by win7 on 2017/7/27.
 */
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');//模块化管理
const $ = gulpLoadPlugins();
const browserSync = require('browser-sync');//自动刷新
const reload = browserSync.reload;
const runSequence=require('run-sequence');//同步
const rev = require('gulp-rev');//版本号
const revCollector = require('gulp-rev-collector');

gulp.task('clean', function () {
    return gulp.src(['dist']).pipe($.clean());
});

gulp.task('scss-css', () => {
    return gulp.src('app/scss/*.scss') //指明源文件路径 读取其数据流
        .pipe($.plumber()) //替换错误的pipe方法  使数据流正常运行
        .pipe($.sourcemaps.init()) //压缩环境出现错误能找到未压缩的错误来源
        .pipe($.sass.sync({        //预编译sass
            outputStyle: 'compressed', //CSS编译后的方式
            precision: 10,//保留小数点后几位
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe(gulp.dest('app/styles'));  //指定输出路径
});

gulp.task('es6-es5', () => {
    return gulp.src('app/scripts_es6/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('app/scripts'));
});

gulp.task('jsmin', () => {
    return gulp.src('app/scripts/*.js')
        .pipe($.plumber())
        .pipe($.uglify())
        .pipe(rev())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/scripts'));
})

gulp.task('revcss',()=>{
    return gulp.src('app/styles/*.css')
        .pipe(rev())
        .pipe(gulp.dest('dist/styles'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/styles'))
})

gulp.task('imagesmin', () => {
    return gulp.src('app/images/**')
        .pipe($.cache($.imagemin({ //使用cache只压缩改变的图片
                optimizationLevel: 3,         //压缩级别
                progressive: true,
                interlaced: true
            })
        )).pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
    return gulp.src('app/fonts/*.{eot,svg,ttf,woff,woff2}')  //main-bower-files会从bower.json文件里寻找定义好的主要文件路径
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('htmlmin', () => {   //先执行styles scripts任务
    var version = (new Date).valueOf() + '';
    var options = {
        removeComments: false,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: false,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: false,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: false,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: false,//删除<style>和<link>的type="text/css"
        minifyJS: false,//压缩页面里的JS
        minifyCSS: false//压缩页面里的CSS
    };
    return gulp.src(['dist/**/*.json', 'app/*.html'])
        .pipe($.plumber())
        .pipe(revCollector())
        .pipe(gulp.dest('dist'));
});


//开发命令
gulp.task('run', ['scss-css', 'es6-es5'], () => {

    gulp.watch('app/scss/*.scss', ['scss-css']); //监测变化 执行styles任务
    gulp.watch('app/scripts_es6/*.js', ['es6-es5']);

    browserSync({
        server: {
            baseDir: ['app'], //确定根目录
            index: 'index.html'
        }
    });
    gulp.watch('app/*.html').on('change', reload);
    gulp.watch('app/styles/*.css').on('change', reload);
    gulp.watch('app/scripts/*.js').on('change', reload);
    gulp.watch('app/images/**').on('change', reload);
});

//打包命令
gulp.task('build',callback=>{
    //同步执行
    runSequence(
        'clean',
        ['jsmin', 'revcss','imagesmin'],
        'htmlmin',
        callback
    )
});

