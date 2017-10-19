define(['ojs/ojcore', 'text!./alex-component.html', './alex-component', 'text!./component.json', 'css!./alex-component', 'ojs/ojcomposite'],
    function(oj, view, viewModel, metadata) {
        oj.Composite.register('alex-component', {
            view: {inline: view},
            viewModel: {inline: viewModel},
            metadata: {inline: JSON.parse(metadata)}
        });
    }
);