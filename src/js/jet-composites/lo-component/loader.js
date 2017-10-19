define(['ojs/ojcore', 'text!./lo-component.html', './lo-component', 'text!./component.json', 'css!./lo-component', 'ojs/ojcomposite'],
    function(oj, view, viewModel, metadata) {
        oj.Composite.register('lo-component', {
            view: {inline: view},
            viewModel: {inline: viewModel},
            metadata: {inline: JSON.parse(metadata)}
        });
    }
);