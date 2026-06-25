export const freelancerOnly = (req, res, next) => {

    if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated"
            });
    }

    if(req.user.role !== 'freelancer'){
        res.status(403).json({ message: 'Only freelancers can access this route' })
    }
    
    next();

}

export const clientOnly = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    if(req.user.role !== 'client'){
        res.status(403).json({ message: 'Only clients can access this route' })
    }

    next();

}

export const adminOnly = (req, res, next) => {
    
    if (!req.user) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    if(req.user.role !== 'admin'){
        res.status(403).json({ message: 'Only admin can access this route' })
    }

    next();

}